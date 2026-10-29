
/* ==========================================================
   PORTOTEC | SOLUÇÕES TECNOLÓGICAS
   Desenvolvido por Araujo Systems

   ARQUIVO: js/script.js
   VERSÃO: 2.0

   FUNCIONALIDADES:

   01. Inicialização geral
   02. Ícones Lucide
   03. Menu mobile responsivo
   04. Cabeçalho dinâmico
   05. Navegação ativa
   06. Animações ao rolar
   07. Botão voltar ao topo
   08. Máscara de telefone
   09. Validação do formulário
   10. Integração com WhatsApp
   11. Atualização do copyright
   12. Segurança de links
   13. Acessibilidade
   14. Eventos e inicialização final

   OBSERVAÇÃO:
   O controle de tema claro/escuro já existe no HTML.
   Não registramos outro clique para evitar conflitos.
========================================================== */

"use strict";


/* ==========================================================
   01. IDENTIFICAR JAVASCRIPT ATIVO
========================================================== */

document.documentElement.classList.add("js");


document.addEventListener("DOMContentLoaded", () => {

    /* ======================================================
       02. CONFIGURAÇÕES DA PORTOTEC
    ====================================================== */

    const CONFIG = Object.freeze({

        empresa: "PortoTec",

        whatsapp: "5521995928425",

        mobileBreakpoint: 991,

        headerScrollPosition: 30,

        backToTopPosition: 450,

        animationThreshold: 0.12,

        maxMessageLength: 2000

    });


    /* ======================================================
       03. REFERÊNCIAS AOS ELEMENTOS
    ====================================================== */

    const header = document.getElementById("header");

    const mainNav = document.getElementById("mainNav");

    const menuToggle = document.getElementById("menuToggle");

    const navLinks = Array.from(
        document.querySelectorAll(".nav__link")
    );

    const backToTop = document.getElementById("backToTop");

    const currentYear = document.getElementById("currentYear");

    const contactForm = document.getElementById("contactForm");

    const formFeedback = document.getElementById("formFeedback");

    const phoneInput = document.getElementById("telefone");

    const revealElements = document.querySelectorAll(
        "[data-reveal]"
    );


    /* ======================================================
       04. BIBLIOTECA DE ÍCONES
    ====================================================== */

    function initializeIcons() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons === "function"
        ) {

            window.lucide.createIcons();

            return true;

        }

        console.warn(
            "PortoTec: biblioteca Lucide indisponível."
        );

        return false;

    }


    initializeIcons();


    /* ======================================================
       05. MENU MOBILE RESPONSIVO
    ====================================================== */

    function isMobile() {

        return window.innerWidth <= CONFIG.mobileBreakpoint;

    }


    function isMenuOpen() {

        return mainNav?.classList.contains("is-open") || false;

    }


    /* Atualização visual do botão do menu */

    function updateMenuIcon(open) {

        if (!menuToggle) return;

        const iconName = open ? "x" : "menu";

        if (window.lucide?.createIcons) {

            menuToggle.innerHTML = `
                <i data-lucide="${iconName}"
                   aria-hidden="true"></i>
            `;

            window.lucide.createIcons();

        } else {

            menuToggle.textContent = open ? "✕" : "☰";

        }

    }


    /* Alteração de estado do menu */

    function setMenuState(open, restoreFocus = false) {

        if (!mainNav || !menuToggle) return;

        const shouldOpen = open && isMobile();

        mainNav.classList.toggle(
            "is-open",
            shouldOpen
        );

        document.body.classList.toggle(
            "menu-open",
            shouldOpen
        );

        menuToggle.setAttribute(
            "aria-expanded",
            String(shouldOpen)
        );

        menuToggle.setAttribute(
            "aria-label",
            shouldOpen ? "Fechar menu" : "Abrir menu"
        );

        updateMenuIcon(shouldOpen);


        /* Permite rolagem quando o menu mobile
           possui muitos itens. */

        if (shouldOpen) {

            mainNav.style.maxHeight =
                `calc(100dvh - ${header?.offsetHeight || 76}px)`;

            mainNav.style.overflowY = "auto";

        } else {

            mainNav.style.maxHeight = "";

            mainNav.style.overflowY = "";

        }


        if (restoreFocus && !shouldOpen) {

            menuToggle.focus();

        }

    }


    function openMenu() {

        setMenuState(true);

    }


    function closeMenu(restoreFocus = false) {

        setMenuState(false, restoreFocus);

    }


    function toggleMenu() {

        setMenuState(!isMenuOpen());

    }


    function initializeMobileMenu() {

        if (!menuToggle || !mainNav) return;


        /* Botão abrir / fechar */

        menuToggle.addEventListener("click", toggleMenu);


        /* Fechar ao selecionar uma seção */

        navLinks.forEach((link) => {

            link.addEventListener("click", () => {

                if (isMenuOpen()) {

                    closeMenu();

                }

            });

        });


        /* Fechar ao clicar fora */

        document.addEventListener("click", (event) => {

            if (!isMenuOpen()) return;

            const clickedNav = mainNav.contains(
                event.target
            );

            const clickedToggle = menuToggle.contains(
                event.target
            );

            if (!clickedNav && !clickedToggle) {

                closeMenu();

            }

        });


        /* Fechar usando ESC */

        document.addEventListener("keydown", (event) => {

            if (
                event.key === "Escape" &&
                isMenuOpen()
            ) {

                closeMenu(true);

            }

        });


        /* Atualização para desktop */

        window.addEventListener("resize", () => {

            if (!isMobile() && isMenuOpen()) {

                closeMenu();

            }

        });

    }


    initializeMobileMenu();


    /* ======================================================
       06. CABEÇALHO DINÂMICO
    ====================================================== */

    function updateHeader() {

        if (!header) return;

        const scrolled =
            window.scrollY > CONFIG.headerScrollPosition;

        header.classList.toggle(
            "scrolled",
            scrolled
        );

    }


    /* ======================================================
       07. NAVEGAÇÃO INTELIGENTE
    ====================================================== */

    /*
       A navegação acompanha a seção visível.

       Importante:
       As seções são ordenadas pela posição no documento,
       pois a ordem do menu pode ser diferente da ordem
       real do HTML.
    */

    const navigationSections = navLinks
        .map((link) => {

            const href = link.getAttribute("href");

            if (!href || !href.startsWith("#")) {

                return null;

            }

            const section = document.getElementById(
                href.substring(1)
            );

            if (!section) return null;

            return {
                link,
                section
            };

        })
        .filter(Boolean)
        .sort((a, b) => {

            const first = a.section.getBoundingClientRect().top;

            const second = b.section.getBoundingClientRect().top;

            return first - second;

        });


    function updateActiveNavigation() {

        if (!navigationSections.length) return;

        const referencePosition =
            (header?.offsetHeight || 84) + 120;

        let currentSection =
            navigationSections[0].section.id;


        navigationSections.forEach(({ section }) => {

            const sectionTop =
                section.getBoundingClientRect().top;

            if (sectionTop <= referencePosition) {

                currentSection = section.id;

            }

        });


        /* Caso o visitante esteja no final da página */

        const atPageBottom =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 4;

        if (atPageBottom) {

            const lastSection =
                navigationSections[navigationSections.length - 1];

            currentSection = lastSection.section.id;

        }


        navLinks.forEach((link) => {

            const active =
                link.getAttribute("href") ===
                `#${currentSection}`;

            link.classList.toggle(
                "active",
                active
            );

            if (active) {

                link.setAttribute(
                    "aria-current",
                    "location"
                );

            } else {

                link.removeAttribute("aria-current");

            }

        });

    }


    /* ======================================================
       08. BOTÃO VOLTAR AO TOPO
    ====================================================== */

    const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


    function getScrollBehavior() {

        return reducedMotionQuery.matches
            ? "auto"
            : "smooth";

    }


    function updateBackToTop() {

        if (!backToTop) return;

        const visible =
            window.scrollY >= CONFIG.backToTopPosition;

        backToTop.classList.toggle(
            "show",
            visible
        );

        backToTop.setAttribute(
            "aria-hidden",
            String(!visible)
        );

        backToTop.tabIndex = visible ? 0 : -1;

    }


    if (backToTop) {

        backToTop.addEventListener("click", () => {

            window.scrollTo({

                top: 0,

                left: 0,

                behavior: getScrollBehavior()

            });

        });

    }


    /* ======================================================
       09. OTIMIZAÇÃO DOS EVENTOS DE ROLAGEM
    ====================================================== */

    let scrollScheduled = false;


    function updateScrollInterface() {

        updateHeader();

        updateActiveNavigation();

        updateBackToTop();

        scrollScheduled = false;

    }


    function scheduleScrollUpdate() {

        if (scrollScheduled) return;

        scrollScheduled = true;

        window.requestAnimationFrame(
            updateScrollInterface
        );

    }


    window.addEventListener(
        "scroll",
        scheduleScrollUpdate,
        { passive: true }
    );


    window.addEventListener(
        "resize",
        scheduleScrollUpdate,
        { passive: true }
    );


    window.addEventListener(
        "hashchange",
        scheduleScrollUpdate
    );


    window.addEventListener(
        "pageshow",
        scheduleScrollUpdate
    );


    /* ======================================================
       10. ANIMAÇÕES AO ROLAR A PÁGINA
    ====================================================== */

    function showRevealElement(element) {

        element.classList.add("is-visible");

    }


    function initializeRevealAnimations() {

        if (!revealElements.length) return;


        /* Sem animação para usuários que
           preferem movimento reduzido. */

        if (
            reducedMotionQuery.matches ||
            !("IntersectionObserver" in window)
        ) {

            revealElements.forEach(showRevealElement);

            return;

        }


        const observer = new IntersectionObserver(

            (entries, currentObserver) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) return;

                    showRevealElement(entry.target);

                    currentObserver.unobserve(
                        entry.target
                    );

                });

            },

            {

                root: null,

                threshold: CONFIG.animationThreshold,

                rootMargin: "0px 0px -20px 0px"

            }

        );


        revealElements.forEach((element) => {

            observer.observe(element);

        });


        /* Se a preferência de movimento mudar
           durante a visita, mostrar os elementos. */

        reducedMotionQuery.addEventListener?.(
            "change",
            (event) => {

                if (!event.matches) return;

                observer.disconnect();

                revealElements.forEach(showRevealElement);

            }
        );

    }


    initializeRevealAnimations();


    /* ======================================================
       11. MÁSCARA DE TELEFONE BRASILEIRO
    ====================================================== */

    function extractPhoneDigits(value) {

        let digits = String(value || "").replace(
            /\D/g,
            ""
        );


        /* Remove código de país +55
           quando um telefone completo for colado. */

        if (
            digits.startsWith("55") &&
            digits.length > 11
        ) {

            digits = digits.substring(2);

        }

        return digits.substring(0, 11);

    }


    function formatPhone(value) {

        const digits = extractPhoneDigits(value);

        if (!digits) return "";

        if (digits.length <= 2) {

            return `(${digits}`;

        }


        const ddd = digits.substring(0, 2);

        const number = digits.substring(2);

        const prefixLength =
            digits.length === 11 ? 5 : 4;


        if (number.length <= prefixLength) {

            return `(${ddd}) ${number}`;

        }


        const prefix = number.substring(
            0,
            prefixLength
        );

        const suffix = number.substring(
            prefixLength
        );


        return `(${ddd}) ${prefix}-${suffix}`;

    }


    function validatePhone() {

        if (!phoneInput) return false;

        const digits = extractPhoneDigits(
            phoneInput.value
        );

        const validLength =
            digits.length === 10 ||
            digits.length === 11;

        const validDDD = /^[1-9][0-9]/.test(
            digits
        );

        const valid = validLength && validDDD;


        phoneInput.setCustomValidity(
            valid
                ? ""
                : "Informe um telefone válido com DDD."
        );

        return valid;

    }


    function initializePhoneMask() {

        if (!phoneInput) return;


        /* Permite colar números com +55 antes
           da máscara ser aplicada. */

        phoneInput.maxLength = 25;

        phoneInput.setAttribute(
            "inputmode",
            "numeric"
        );


        phoneInput.addEventListener("input", () => {

            phoneInput.setCustomValidity("");

            phoneInput.value = formatPhone(
                phoneInput.value
            );

        });


        phoneInput.addEventListener("blur", () => {

            phoneInput.value = formatPhone(
                phoneInput.value
            );

        });

    }


    initializePhoneMask();


    /* ======================================================
       12. NORMALIZAÇÃO DOS DADOS
    ====================================================== */

    function normalizeSingleLine(
        value,
        maxLength = 150
    ) {

        return String(value || "")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, maxLength);

    }


    function normalizeMessage(
        value,
        maxLength = CONFIG.maxMessageLength
    ) {

        return String(value || "")
            .replace(/\r\n/g, "\n")
            .trim()
            .substring(0, maxLength);

    }


    /* ======================================================
       13. FEEDBACK DO FORMULÁRIO
    ====================================================== */

    function clearFormFeedback() {

        if (!formFeedback) return;

        formFeedback.textContent = "";

        formFeedback.classList.remove(
            "success",
            "error"
        );

    }


    function showFormFeedback(
        message,
        type = "error",
        actionUrl = null
    ) {

        if (!formFeedback) return;

        clearFormFeedback();

        formFeedback.classList.add(type);

        formFeedback.appendChild(
            document.createTextNode(message)
        );


        /* Link alternativo caso a abertura
           automática do WhatsApp seja bloqueada. */

        if (actionUrl) {

            formFeedback.appendChild(
                document.createTextNode(" ")
            );

            const link = document.createElement("a");

            link.href = actionUrl;

            link.target = "_blank";

            link.rel = "noopener noreferrer";

            link.textContent =
                "Clique aqui para abrir o WhatsApp.";

            link.style.display = "inline-block";

            link.style.marginTop = "8px";

            link.style.color = "var(--primary)";

            link.style.textDecoration = "underline";

            link.style.textUnderlineOffset = "3px";

            link.style.fontWeight = "700";

            formFeedback.appendChild(link);

        }

    }


    /* ======================================================
       14. COLETA DOS DADOS DO FORMULÁRIO
    ====================================================== */

    function collectFormData() {

        return {

            nome: normalizeSingleLine(
                document.getElementById("nome")?.value,
                120
            ),

            empresa: normalizeSingleLine(
                document.getElementById("empresa")?.value,
                120
            ),

            email: normalizeSingleLine(
                document.getElementById("email")?.value,
                180
            ),

            telefone: normalizeSingleLine(
                phoneInput?.value,
                20
            ),

            assunto: normalizeSingleLine(
                document.getElementById("assunto")?.value,
                100
            ),

            mensagem: normalizeMessage(
                document.getElementById("mensagem")?.value
            )

        };

    }


    /* ======================================================
       15. MENSAGEM PROFISSIONAL PARA WHATSAPP
    ====================================================== */

    function createWhatsAppMessage(data) {

        const lines = [

            "*PORTOTEC | SOLICITAÇÃO DE COTAÇÃO*",

            "",

            "Olá, equipe PortoTec!",

            "Estou entrando em contato através do site.",

            "",

            "*DADOS DO CLIENTE*",

            `Nome: ${data.nome}`,

            ...(data.empresa
                ? [`Empresa: ${data.empresa}`]
                : []),

            `E-mail: ${data.email}`,

            `Telefone: ${data.telefone}`,

            "",

            "*INFORMAÇÕES DA SOLICITAÇÃO*",

            `Assunto: ${data.assunto}`,

            "",

            "*DESCRIÇÃO*",

            data.mensagem,

            "",

            "Aguardo o retorno da equipe comercial.",

            "",

            "Enviado através do site PortoTec."

        ];


        return lines.join("\n");

    }


    /* ======================================================
       16. INTEGRAÇÃO COM WHATSAPP
    ====================================================== */

    function createWhatsAppURL(message) {

        const encodedMessage = encodeURIComponent(
            message
        );

        return (
            `https://wa.me/${CONFIG.whatsapp}` +
            `?text=${encodedMessage}`
        );

    }


    function openWhatsApp(url) {

        /*
           Esta função é chamada diretamente
           pelo envio do formulário.

           Alguns navegadores podem bloquear
           novas abas. Por isso, também
           apresentaremos um link alternativo.
        */

        try {

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

        } catch (error) {

            console.warn(
                "PortoTec: abertura automática indisponível.",
                error
            );

        }

    }


    /* ======================================================
       17. ENVIO DO FORMULÁRIO
    ====================================================== */

    function initializeContactForm() {

        if (!contactForm) return;


        contactForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                clearFormFeedback();


                /* Verificação dos campos nativos */

                if (!contactForm.reportValidity()) {

                    return;

                }


                /* Verificação complementar do telefone */

                if (!validatePhone()) {

                    phoneInput.reportValidity();

                    showFormFeedback(
                        "Confira o telefone informado.",
                        "error"
                    );

                    return;

                }


                const data = collectFormData();


                /* Evitar envio de campos
                   preenchidos apenas com espaços. */

                if (
                    !data.nome ||
                    !data.email ||
                    !data.telefone ||
                    !data.assunto ||
                    !data.mensagem
                ) {

                    showFormFeedback(
                        "Preencha corretamente todos os campos obrigatórios.",
                        "error"
                    );

                    return;

                }


                /* Gerar a mensagem */

                const message = createWhatsAppMessage(
                    data
                );


                /* Gerar URL oficial do WhatsApp */

                const whatsappURL = createWhatsAppURL(
                    message
                );


                /* Solicitar abertura diretamente
                   durante a ação do usuário. */

                openWhatsApp(whatsappURL);


                /* Não afirmar que foi enviado.
                   O cliente precisa confirmar
                   manualmente no WhatsApp. */

                showFormFeedback(

                    "Sua solicitação foi preparada. Revise a mensagem no WhatsApp e confirme o envio.",

                    "success",

                    whatsappURL

                );


                /*
                   Não limpamos o formulário aqui.

                   O visitante poderá voltar,
                   corrigir os dados e tentar
                   novamente se necessário.
                */

            }
        );


        /* Limpar mensagens antigas quando
           o visitante alterar os campos. */

        const fields = contactForm.querySelectorAll(
            "input, select, textarea"
        );


        fields.forEach((field) => {

            field.addEventListener("input", () => {

                clearFormFeedback();

            });

            field.addEventListener("change", () => {

                clearFormFeedback();

            });

        });

    }


    initializeContactForm();


    /* ======================================================
       18. ANO AUTOMÁTICO NO RODAPÉ
    ====================================================== */

    function updateCopyrightYear() {

        if (!currentYear) return;

        currentYear.textContent =
            new Date().getFullYear();

    }


    updateCopyrightYear();


    /* ======================================================
       19. SEGURANÇA DOS LINKS EXTERNOS
    ====================================================== */

    function initializeExternalLinks() {

        const externalLinks = document.querySelectorAll(
            'a[target="_blank"]'
        );


        externalLinks.forEach((link) => {

            link.rel = "noopener noreferrer";

        });

    }


    initializeExternalLinks();


    /* ======================================================
       20. AJUSTES DE ACESSIBILIDADE
    ====================================================== */

    function initializeAccessibility() {

        /* Botão voltar ao topo começa
           fora da ordem de tabulação. */

        updateBackToTop();


        /* O botão de menu indica inicialmente
           que a navegação está fechada. */

        if (menuToggle) {

            menuToggle.setAttribute(
                "aria-expanded",
                String(isMenuOpen())
            );

        }


        /* O controle de tema é administrado
           pelo script que está no HTML.

           Não registrar outro evento aqui.
        */

    }


    initializeAccessibility();


    /* ======================================================
       21. ATUALIZAÇÃO DO LAYOUT
    ====================================================== */

    function initializeLayout() {

        updateScrollInterface();

        /* Após o carregamento das imagens
           e demais recursos. */

        window.addEventListener("load", () => {

            scheduleScrollUpdate();

        });


        /* Ajustes ao retornar para a página */

        window.addEventListener("pageshow", () => {

            scheduleScrollUpdate();

        });

    }


    initializeLayout();


    /* ======================================================
       22. IDENTIFICAÇÃO DO PROJETO
    ====================================================== */

    console.info(
        "%cPortoTec | Soluções Tecnológicas",
        "color:#2446f5;font-size:18px;font-weight:800;"
    );

    console.info(
        "%cDesenvolvido por Araujo Systems",
        "color:#7c8da8;font-size:12px;font-weight:600;"
    );

    console.info(
        "PortoTec: inicialização concluída."
    );

});


/* ==========================================================
   FIM DO JAVASCRIPT

   PORTOTEC 2.0
   SOLUÇÕES TECNOLÓGICAS

   DESENVOLVIDO POR ARAUJO SYSTEMS
========================================================== */
