/**
 * Programa de Fidelidade "Fidelidade Chama"
 * Integração com SheetDB, validação de CPF, telefone BR e sistema de selos
 */
(function () {
  "use strict";

  // ============================================
  // CONFIGURAÇÃO
  // ============================================
  var SHEETDB_API_URL = "https://sheetdb.io/api/v1/YOUR_SHEETDB_API_KEY"; // Substituir pela URL real
  var WHATSAPP_NUMBER = "5571995855142"; // Número do restaurante

  // ============================================
  // UTILITÁRIOS
  // ============================================

  /**
   * Criptografa CPF usando SHA-256
   */
  async function hashCPF(cpf) {
    var cpfLimpo = cpf.replace(/\D/g, "");
    var buffer = new TextEncoder().encode(cpfLimpo);
    var hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    var hashHex = hashArray.map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
    return hashHex;
  }

  /**
   * Valida CPF (dígitos verificadores)
   */
  function validarCPF(cpf) {
    var cpfLimpo = cpf.replace(/\D/g, "");
    
    // CPF deve ter 11 dígitos
    if (cpfLimpo.length !== 11) return false;
    
    // CPF não pode ter todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    // Validação dos dígitos verificadores
    var soma = 0;
    var peso = 10;

    for (var i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo[i]) * peso;
      peso--;
    }

    var digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;

    if (parseInt(cpfLimpo[9]) !== digito1) return false;

    soma = 0;
    peso = 11;

    for (var j = 0; j < 10; j++) {
      soma += parseInt(cpfLimpo[j]) * peso;
      peso--;
    }

    var digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;

    return parseInt(cpfLimpo[10]) === digito2;
  }

  /**
   * Aplica máscara de CPF: 000.000.000-00
   */
  function mascaraCPF(input) {
    var v = input.value.replace(/\D/g, "").slice(0, 11);
    var out = "";
    if (v.length > 0) out = v.slice(0, 3);
    if (v.length > 3) out += "." + v.slice(3, 6);
    if (v.length > 6) out += "." + v.slice(6, 9);
    if (v.length > 9) out += "-" + v.slice(9, 11);
    input.value = out;
  }

  /**
   * Aplica máscara de telefone BR: +55 (00) 00000-0000
   */
  function mascaraTelefone(input) {
    var v = input.value.replace(/\D/g, "").slice(0, 13); // +55 + DDD + 8 dígitos
    var out = "";
    
    if (v.length > 0) out = "+";
    if (v.length > 0) out += v.slice(0, 2);
    if (v.length > 2) out += " (" + v.slice(2, 4);
    if (v.length > 4) out += ") " + v.slice(4, 9);
    if (v.length > 9) out += "-" + v.slice(9, 13);
    
    input.value = out;
  }

  /**
   * Determina o nível do cliente baseado no número de pedidos
   */
  function getNivel(pedidos) {
    var count = pedidos || 0;
    if (count >= 10) return "ouro";
    if (count >= 5) return "prata";
    return "bronze";
  }

  /**
   * Retorna benefícios do nível
   */
  function getBeneficios(nivel) {
    var beneficios = {
      bronze: { nome: "Bronze", desconto: "5% off", requisitos: "1-4 pedidos" },
      prata: { nome: "Prata", desconto: "10% off", extra: "batata grátis", requisitos: "5-9 pedidos" },
      ouro: { nome: "Ouro", desconto: "15% off", extra: "entrega grátis + prioridade", requisitos: "10+ pedidos" }
    };
    return beneficios[nivel] || beneficios.bronze;
  }

  // ============================================
  // SHEETDB - API
  // ============================================

  /**
   * Busca cliente por CPF hash
   */
  async function buscarClientePorCPF(cpfHash) {
    try {
      var response = await fetch(SHEETDB_API_URL + "/search?cpf_hash=" + encodeURIComponent(cpfHash));
      if (!response.ok) throw new Error("Erro na busca");
      var data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (e) {
      console.error("Erro ao buscar cliente:", e);
      return null;
    }
  }

  /**
   * Cadastra novo cliente
   */
  async function cadastrarCliente(dados) {
    var payload = {
      cpf_hash: dados.cpfHash,
      nome: dados.nome,
      telefone: dados.telefone,
      pontos: 0,
      selo: "bronze",
      data_cadastro: new Date().toISOString().split("T")[0],
      pedidos: [],
      consentimento: dados.consentimento,
      ativo: true
    };

    try {
      var response = await fetch(SHEETDB_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error("Erro ao cadastrar");
      return await response.json();
    } catch (e) {
      console.error("Erro ao cadastrar:", e);
      throw e;
    }
  }

  /**
   * Atualiza dados do cliente
   */
  async function atualizarCliente(cpfHash, dados) {
    try {
      var response = await fetch(SHEETDB_API_URL + "/search?cpf_hash=" + encodeURIComponent(cpfHash), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      });
      
      if (!response.ok) throw new Error("Erro ao atualizar");
      return await response.json();
    } catch (e) {
      console.error("Erro ao atualizar:", e);
      throw e;
    }
  }

  // ============================================
  // UI - MODAL
  // ============================================

  function criarModal() {
    // Remove modal existente se houver
    var existing = document.getElementById("modal-fidelidade");
    if (existing) existing.remove();

    var modal = document.createElement("div");
    modal.id = "modal-fidelidade";
    modal.className = "modal-fidelidade";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "modal-fidelidade-titulo");
    modal.setAttribute("aria-modal", "true");
    modal.hidden = true;

    modal.innerHTML = `
      <div class="modal-fidelidade__overlay" data-fechar></div>
      <div class="modal-fidelidade__content">
        <button type="button" class="modal-fidelidade__fechar" data-fechar aria-label="Fechar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <div class="modal-fidelidade__header">
          <h2 id="modal-fidelidade-titulo">🎁 Fidelidade Chama</h2>
          <p class="modal-fidelidade__subtitle">Cadastre-se e ganhe benefícios exclusivos!</p>
        </div>

        <form id="form-fidelidade" class="form-fidelidade">
          <div class="form-fidelidade__field">
            <label for="fid-cpf">CPF <span class="obrigatorio">*</span></label>
            <input type="text" id="fid-cpf" name="cpf" required placeholder="000.000.000-00" autocomplete="off">
            <span class="form-fidelidade__error" id="fid-cpf-error"></span>
          </div>

          <div class="form-fidelidade__field">
            <label for="fid-nome">Nome completo <span class="obrigatorio">*</span></label>
            <input type="text" id="fid-nome" name="nome" required placeholder="Seu nome" autocomplete="name">
            <span class="form-fidelidade__error" id="fid-nome-error"></span>
          </div>

          <div class="form-fidelidade__field">
            <label for="fid-telefone">WhatsApp <span class="obrigatorio">*</span></label>
            <input type="tel" id="fid-telefone" name="telefone" required placeholder="+55 (00) 00000-0000" autocomplete="tel">
            <span class="form-fidelidade__error" id="fid-telefone-error"></span>
          </div>

          <div class="form-fidelidade__beneficios">
            <h3>Benefícios do Programa</h3>
            <div class="beneficios-grid">
              <div class="beneficio-card beneficio-card--bronze">
                <span class="beneficio-card__nivel">🥉 Bronze</span>
                <span class="beneficio-card__desconto">5% off</span>
                <span class="beneficio-card__req">1-4 pedidos</span>
              </div>
              <div class="beneficio-card beneficio-card--prata">
                <span class="beneficio-card__nivel">🥈 Prata</span>
                <span class="beneficio-card__desconto">10% off</span>
                <span class="beneficio-card__extra">+ batata grátis</span>
                <span class="beneficio-card__req">5-9 pedidos</span>
              </div>
              <div class="beneficio-card beneficio-card--ouro">
                <span class="beneficio-card__nivel">🥇 Ouro</span>
                <span class="beneficio-card__desconto">15% off</span>
                <span class="beneficio-card__extra">+ entrega grátis + prioridade</span>
                <span class="beneficio-card__req">10+ pedidos</span>
              </div>
            </div>
          </div>

          <div class="form-fidelidade__lgpd">
            <label class="checkbox-lgpd">
              <input type="checkbox" id="fid-consentimento-dados" required>
              <span class="checkbox-lgpd__mark"></span>
              <span class="checkbox-lgpd__text">
                Eu concordo com a coleta e armazenamento dos meus dados pessoais (CPF, nome, telefone) para participação no programa de fidelidade. *
              </span>
            </label>
            <label class="checkbox-lgpd">
              <input type="checkbox" id="fid-consentimento-marketing">
              <span class="checkbox-lgpd__mark"></span>
              <span class="checkbox-lgpd__text">
                Quero receber promoções e novidades pelo WhatsApp.
              </span>
            </label>
          </div>

          <div class="form-fidelidade__actions">
            <button type="submit" class="btn btn-primary btn-lg" id="fid-submit">
              <span class="btn-text">Cadastrar</span>
              <span class="btn-loading" hidden>Cadastrando...</span>
            </button>
          </div>

          <div class="form-fidelidade__result" id="fid-result" hidden></div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  function abrirModal() {
    var modal = document.getElementById("modal-fidelidade");
    if (!modal) modal = criarModal();
    modal.hidden = false;
    document.body.classList.add("modal-open");
    
    // Foca no primeiro campo
    setTimeout(function() {
      var cpfInput = document.getElementById("fid-cpf");
      if (cpfInput) cpfInput.focus();
    }, 100);
  }

  function fecharModal() {
    var modal = document.getElementById("modal-fidelidade");
    if (modal) modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  // ============================================
  // VALIDAÇÃO EM TEMPO REAL
  // ============================================

  function setupValidacaoTempoReal() {
    var cpfInput = document.getElementById("fid-cpf");
    var nomeInput = document.getElementById("fid-nome");
    var telefoneInput = document.getElementById("fid-telefone");

    if (cpfInput) {
      cpfInput.addEventListener("input", function () {
        mascaraCPF(this);
        validarCampoTempoReal(this, function (valor) {
          var cpfLimpo = valor.replace(/\D/g, "");
          if (cpfLimpo.length === 0) return { valido: false, msg: "" };
          if (cpfLimpo.length < 11) return { valido: false, msg: "CPF incompleto" };
          if (!validarCPF(valor)) return { valido: false, msg: "CPF inválido" };
          return { valido: true, msg: "" };
        });
      });
    }

    if (nomeInput) {
      nomeInput.addEventListener("input", function () {
        validarCampoTempoReal(this, function (valor) {
          if (valor.trim().length < 2) return { valido: false, msg: "Nome muito curto" };
          return { valido: true, msg: "" };
        });
      });
    }

    if (telefoneInput) {
      telefoneInput.addEventListener("input", function () {
        mascaraTelefone(this);
        validarCampoTempoReal(this, function (valor) {
          var telLimpo = valor.replace(/\D/g, "");
          if (telLimpo.length < 10) return { valido: false, msg: "Telefone incompleto" };
          if (telLimpo.length > 13) return { valido: false, msg: "Telefone inválido" };
          return { valido: true, msg: "" };
        });
      });
    }
  }

  function validarCampoTempoReal(input, validator) {
    var errorEl = document.getElementById(input.id + "-error");
    var result = validator(input.value);
    
    if (!result.valido) {
      input.classList.add("is-invalid");
      if (errorEl) errorEl.textContent = result.msg;
    } else {
      input.classList.remove("is-invalid");
      if (errorEl) errorEl.textContent = "";
    }
    
    return result.valido;
  }

  // ============================================
  // ENVIO DO FORMULÁRIO
  // ============================================

  async function handleSubmit(e) {
    e.preventDefault();

    var cpfInput = document.getElementById("fid-cpf");
    var nomeInput = document.getElementById("fid-nome");
    var telefoneInput = document.getElementById("fid-telefone");
    var consentimentoInput = document.getElementById("fid-consentimento-dados");
    var submitBtn = document.getElementById("fid-submit");
    var resultEl = document.getElementById("fid-result");

    // Valida todos os campos
    var cpfValido = validarCampoTempoReal(cpfInput, function (valor) {
      var cpfLimpo = valor.replace(/\D/g, "");
      if (cpfLimpo.length !== 11 || !validarCPF(valor)) return { valido: false, msg: "CPF inválido" };
      return { valido: true, msg: "" };
    });

    var nomeValido = validarCampoTempoReal(nomeInput, function (valor) {
      if (valor.trim().length < 2) return { valido: false, msg: "Nome obrigatório" };
      return { valido: true, msg: "" };
    });

    var telValido = validarCampoTempoReal(telefoneInput, function (valor) {
      var telLimpo = valor.replace(/\D/g, "");
      if (telLimpo.length < 10) return { valido: false, msg: "Telefone inválido" };
      return { valido: true, msg: "" };
    });

    if (!cpfValido || !nomeValido || !telValido) {
      return;
    }

    if (!consentimentoInput.checked) {
      showToast("Você precisa aceitar os termos de consentimento para continuar.", true);
      return;
    }

    // Loading state
    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;
    submitBtn.querySelector(".btn-text").hidden = true;
    submitBtn.querySelector(".btn-loading").hidden = false;

    try {
      var cpfHash = await hashCPF(cpfInput.value);
      
      // Verifica se CPF já existe
      var clienteExistente = await buscarClientePorCPF(cpfHash);

      if (clienteExistente) {
        // Cliente já existe - mostra dados e link mágico
        var nivel = getNivel(clienteExistente.pedidos ? clienteExistente.pedidos.length : 0);
        var beneficios = getBeneficios(nivel);
        
        resultEl.hidden = false;
        resultEl.className = "form-fidelidade__result form-fidelidade__result--success";
        resultEl.innerHTML = `
          <div class="result-success">
            <span class="result-icon">✅</span>
            <h4>Bem-vindo de volta, ${clienteExistente.nome}!</h4>
            <p class="result-nivel">Seu nível: <strong>${beneficios.nivel}</strong> (${beneficios.desconto})</p>
            <p class="result-pedidos">Pedidos: ${clienteExistente.pedidos ? clienteExistente.pedidos.length : 0}</p>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Quero usar meu benefício de " + beneficios.nivel + " (" + beneficios.desconto + ")")}" 
               class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
              📱 Usar benefício pelo WhatsApp
            </a>
          </div>
        `;
      } else {
        // Novo cadastro
        var dados = {
          cpfHash: cpfHash,
          nome: nomeInput.value.trim(),
          telefone: telefoneInput.value,
          consentimento: {
            dados: true,
            marketing: document.getElementById("fid-consentimento-marketing").checked,
            data: new Date().toISOString()
          }
        };

        await cadastrarCliente(dados);

        resultEl.hidden = false;
        resultEl.className = "form-fidelidade__result form-fidelidade__result--success";
        resultEl.innerHTML = `
          <div class="result-success">
            <span class="result-icon">🎉</span>
            <h4>Cadastro realizado com sucesso!</h4>
            <p>Você agora é parte do programa Fidelidade Chama.</p>
            <p class="result-nivel">Seu nível atual: <strong>Bronze</strong> (5% off)</p>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Acabei de me cadastrar no Fidelidade Chama e quero fazer meu primeiro pedido!")}" 
               class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
              📱 Fazer primeiro pedido
            </a>
          </div>
        `;

        // Limpa o formulário
        document.getElementById("form-fidelidade").reset();
      }

    } catch (error) {
      console.error("Erro no cadastro:", error);
      resultEl.hidden = false;
      resultEl.className = "form-fidelidade__result form-fidelidade__result--error";
      resultEl.innerHTML = `
        <div class="result-error">
          <span class="result-icon">❌</span>
          <h4>Erro ao cadastrar</h4>
          <p>Não foi possível completar o cadastro. Tente novamente ou entre em contato pelo WhatsApp.</p>
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Tive problemas ao me cadastrar no Fidelidade Chama. Preciso de ajuda.")}" 
             class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
            📱 Falar pelo WhatsApp
          </a>
        </div>
      `;
    } finally {
      submitBtn.classList.remove("is-loading");
      submitBtn.disabled = false;
      submitBtn.querySelector(".btn-text").hidden = false;
      submitBtn.querySelector(".btn-loading").hidden = true;
    }
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================

  function showToast(msg, isError) {
    var el = document.getElementById("toast-site");
    if (!el) {
      // Cria toast se não existir
      el = document.createElement("div");
      el.id = "toast-site";
      el.className = "toast-site";
      el.hidden = true;
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
    el.classList.toggle("toast-site--error", !!isError);
    el.classList.add("toast-site--visible");
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.remove("toast-site--visible");
      el.hidden = true;
    }, 4000);
  }

  // ============================================
  // INICIALIZAÇÃO
  // ============================================

  function init() {
    // Cria o modal
    criarModal();

    // Setup eventos do modal
    var modal = document.getElementById("modal-fidelidade");
    if (modal) {
      // Botão de fechar
      modal.querySelectorAll("[data-fechar]").forEach(function (el) {
        el.addEventListener("click", function (e) {
          if (e.target === el || el.classList.contains("modal-fidelidade__fechar")) {
            fecharModal();
          }
        });
      });

      // Fechar ao pressionar Escape
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !modal.hidden) {
          fecharModal();
        }
      });
    }

    // Setup validação em tempo real
    setupValidacaoTempoReal();

    // Setup submit
    var form = document.getElementById("form-fidelidade");
    if (form) {
      form.addEventListener("submit", handleSubmit);
    }

    // Expõe API global
    window.FidelidadeChama = {
      abrir: abrirModal,
      fechar: fecharModal,
      isOpen: function () {
        var m = document.getElementById("modal-fidelidade");
        return m && !m.hidden;
      }
    };
  }

  // Inicializa quando DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
