// ============================================
// CONFIGURAÇÃO - ALTERE APENAS ESTE NÚMERO
// ============================================
const WHATSAPP_NUMBER = '5527999064068';

// ============================================
// CHATBOT - COLETA DE INFORMAÇÕES BÁSICAS
// ============================================

let chatState = {
    step: 0,
    userData: {},
    serviceStep: 0,
    selectedService: null
};

// Catálogo de serviços
const services = {
    '1': {
        name: '🚗 Zero Multa Trânsito',
        questions: [
            { key: 'placa', question: 'Qual a <strong>placa do veículo</strong>?', placeholder: 'Ex: ABC-1234' },
            { key: 'orgao_multa', question: 'A multa é de qual <strong>órgão</strong>?', placeholder: 'Ex: DETRAN, PRF, Municipal' },
            { key: 'status_multa', question: 'Qual o <strong>status</strong> da multa?', placeholder: 'Ex: Notificação, CNH suspensa, etc' }
        ]
    },
    '2': {
        name: '🔄 Transferência Veicular',
        questions: [
            { key: 'placa', question: 'Qual a <strong>placa do veículo</strong>?', placeholder: 'Ex: ABC-1234' },
            { key: 'chassi', question: 'Qual o número do <strong>chassi</strong>?', placeholder: 'Digite o chassi completo' },
            { key: 'veiculo_quitado', question: 'O veículo está <strong>quitado</strong>?', placeholder: 'Digite: Sim ou Não' },
            { key: 'cidade_registro', question: 'Qual a <strong>cidade</strong> de registro atual?', placeholder: 'Digite a cidade' }
        ]
    },
    '3': {
        name: '📄 Regularização de Documentos',
        questions: [
            { key: 'placa', question: 'Qual a <strong>placa do veículo</strong>?', placeholder: 'Ex: ABC-1234' },
            { key: 'tipo_documento', question: 'Qual <strong>documento</strong> você precisa?', placeholder: 'Ex: CRLV, CRV, 2ª via' },
            { key: 'possui_debitos', question: 'O veículo possui <strong>débitos ou bloqueios</strong>?', placeholder: 'Digite: Sim ou Não' }
        ]
    },
    '4': {
        name: '🔍 Consulta Veicular Completa',
        questions: [
            { key: 'placa', question: 'Qual a <strong>placa do veículo</strong>?', placeholder: 'Ex: ABC-1234' },
            { key: 'objetivo_consulta', question: 'Qual o <strong>objetivo</strong> da consulta?', placeholder: 'Ex: Compra, verificação de débitos' }
        ]
    },
    '5': {
        name: '❤️ Seguro de Vida e Saúde',
        questions: [
            { key: 'data_nascimento', question: 'Qual sua <strong>data de nascimento</strong>?', placeholder: 'Ex: 15/03/1985' },
            { key: 'tipo_seguro', question: 'Interesse em <strong>Vida, Saúde ou ambos</strong>?', placeholder: 'Digite sua preferência' },
            { key: 'profissao', question: 'Qual sua <strong>profissão</strong>?', placeholder: 'Digite sua profissão' }
        ]
    },
    '6': {
        name: '💰 Financiamento Veicular',
        questions: [
            { key: 'valor_veiculo', question: 'Qual o <strong>valor do veículo</strong> desejado?', placeholder: 'Ex: R$ 50.000' },
            { key: 'valor_entrada', question: 'Qual o <strong>valor da entrada</strong>?', placeholder: 'Ex: R$ 10.000' },
            { key: 'veiculo_interesse', question: 'Qual o <strong>veículo</strong> de interesse?', placeholder: 'Ex: Honda Civic 2020' }
        ]
    },
    '7': {
        name: '🏦 Empréstimo com Garantia',
        questions: [
            { key: 'valor_emprestimo', question: 'Qual o <strong>valor do empréstimo</strong>?', placeholder: 'Ex: R$ 30.000' },
            { key: 'tipo_garantia', question: 'Qual será a <strong>garantia</strong>?', placeholder: 'Ex: Veículo ou Imóvel' },
            { key: 'detalhes_garantia', question: 'Detalhes da garantia:', placeholder: 'Ex: Carro Civic 2018 quitado' }
        ]
    },
    '8': {
        name: '⚖️ Revisão de Juros Abusivos',
        questions: [
            { key: 'tipo_contrato', question: 'Qual o <strong>tipo de contrato</strong>?', placeholder: 'Ex: Veicular, Pessoal, Imobiliário' },
            { key: 'instituicao', question: 'Qual a <strong>instituição financeira</strong>?', placeholder: 'Ex: Nome do banco' },
            { key: 'valor_parcela', question: 'Qual o <strong>valor da parcela</strong> atual?', placeholder: 'Ex: R$ 800' }
        ]
    },
    '9': {
        name: '🚚 Registro Nacional (ANTT)',
        questions: [
            { key: 'tipo_pessoa', question: 'Registro para <strong>Pessoa Física ou Jurídica</strong>?', placeholder: 'Digite: Física ou Jurídica' },
            { key: 'tipo_veiculo', question: 'Qual o <strong>tipo de veículo</strong>?', placeholder: 'Ex: Caminhão, Carreta, Van' },
            { key: 'placa', question: 'Qual a <strong>placa do veículo</strong>?', placeholder: 'Ex: ABC-1234' }
        ]
    }
};

// Perguntas iniciais (Nome, Telefone, Cidade)
const initialQuestions = [
    {
        key: 'nome',
        question: 'Olá! 👋 Eu sou o assistente virtual do Anderson Santos. Para iniciarmos, qual é o seu <strong>nome completo</strong>?',
        placeholder: 'Digite seu nome completo'
    },
    {
        key: 'telefone',
        question: 'Prazer em conhecê-lo, {nome}! 😊<br><br>Qual o seu número de <strong>WhatsApp</strong> com DDD?',
        placeholder: 'Ex: (27) 99999-9999'
    },
    {
        key: 'cidade',
        question: 'Perfeito! Em qual <strong>cidade</strong> você está localizado(a)?',
        placeholder: 'Digite sua cidade'
    }
];

// Inicializar o chat
function initChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    askQuestion();
}

// Fazer a próxima pergunta
function askQuestion() {
    // Fase 1: Perguntas iniciais (nome, telefone, cidade)
    if (chatState.step < initialQuestions.length) {
        const currentQ = initialQuestions[chatState.step];
        let questionText = currentQ.question;
        
        // Substituir {nome} pelo primeiro nome do usuário
        if (chatState.userData.nome) {
            const firstName = chatState.userData.nome.split(' ')[0];
            questionText = questionText.replace('{nome}', firstName);
        }
        
        addBotMessage(questionText);
        document.getElementById('userInput').placeholder = currentQ.placeholder;
        enableInput();
    } 
    // Fase 2: Mostrar catálogo de serviços
    else if (chatState.step === initialQuestions.length && !chatState.selectedService) {
        showServiceCatalog();
    }
    // Fase 3: Perguntas específicas do serviço
    else if (chatState.selectedService && chatState.serviceStep < chatState.selectedService.questions.length) {
        const currentQ = chatState.selectedService.questions[chatState.serviceStep];
        addBotMessage(currentQ.question);
        document.getElementById('userInput').placeholder = currentQ.placeholder;
        enableInput();
    }
    // Fase 4: Finalizar
    else {
        finishChat();
    }
}

// Mostrar catálogo de serviços
function showServiceCatalog() {
    const firstName = chatState.userData.nome.split(' ')[0];
    addBotMessage(`Ótimo, ${firstName}! Agora escolha o <strong>serviço</strong> que você precisa:`);
    
    const chatMessages = document.getElementById('chatMessages');
    const catalogDiv = document.createElement('div');
    catalogDiv.className = 'chat-message my-4';
    
    let catalogHTML = '<div class="grid grid-cols-1 gap-2">';
    
    for (let key in services) {
        catalogHTML += `
            <button onclick="selectService('${key}')" class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl transition duration-300 text-left font-semibold shadow-lg transform hover:scale-105">
                ${services[key].name}
            </button>
        `;
    }
    
    catalogHTML += '</div>';
    catalogDiv.innerHTML = catalogHTML;
    chatMessages.appendChild(catalogDiv);
    scrollToBottom();
    disableInput();
}

// Selecionar serviço
function selectService(serviceId) {
    chatState.selectedService = services[serviceId];
    chatState.userData.servico = services[serviceId].name;
    
    addUserMessage(services[serviceId].name);
    
    setTimeout(() => {
        addBotMessage(`Perfeito! Para prosseguir com <strong>${services[serviceId].name}</strong>, preciso de mais algumas informações:`);
        
        setTimeout(() => {
            chatState.serviceStep = 0;
            askQuestion();
        }, 1000);
    }, 500);
}

// Adicionar mensagem do bot
function addBotMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message flex justify-start';
    messageDiv.innerHTML = `
        <div class="chat-bot-message text-gray-800 rounded-2xl rounded-tl-sm p-4 max-w-[80%] shadow-md">
            ${message}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Adicionar mensagem do usuário
function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message flex justify-end';
    messageDiv.innerHTML = `
        <div class="chat-user-message text-white rounded-2xl rounded-tr-sm p-4 max-w-[80%] shadow-md">
            ${message}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Processar a mensagem do usuário
function sendMessage() {
    const userInput = document.getElementById('userInput');
    const userMessage = userInput.value.trim();
    
    if (userMessage === '') return;
    
    addUserMessage(userMessage);
    userInput.value = '';
    disableInput();
    
    if (chatState.step < initialQuestions.length) {
        // Fase 1: Coletar dados iniciais
        const key = initialQuestions[chatState.step].key;
        chatState.userData[key] = userMessage;
        chatState.step++;
    } else if (chatState.selectedService && chatState.serviceStep < chatState.selectedService.questions.length) {
        // Fase 3: Coletar dados do serviço
        const key = chatState.selectedService.questions[chatState.serviceStep].key;
        chatState.userData[key] = userMessage;
        chatState.serviceStep++;
    }
    
    // Pequeno delay para simular o bot pensando
    setTimeout(askQuestion, 800);
}

// Finalizar o chat e gerar link do WhatsApp
function finishChat() {
    const chatMessages = document.getElementById('chatMessages');
    const firstName = chatState.userData.nome.split(' ')[0];
    
    addBotMessage(`Certo, ${firstName}! Coletamos todas as informações. Agora vamos finalizar seu atendimento.`);
    
    let whatsappMessage = `Olá Anderson, meu nome é ${chatState.userData.nome} e estou na cidade de ${chatState.userData.cidade}. Meu telefone é ${chatState.userData.telefone}.%0A%0A`;
    
    if (chatState.selectedService) {
        whatsappMessage += `Gostaria de falar sobre: *${chatState.userData.servico}*%0A%0A`;
        
        let serviceData = '';
        for (const key in chatState.userData) {
            // Ignorar dados iniciais para o resumo de serviço
            if (key !== 'nome' && key !== 'telefone' && key !== 'cidade' && key !== 'servico') {
                const label = chatState.selectedService.questions.find(q => q.key === key)?.question.replace(/<\/?strong>/g, '') || key;
                serviceData += `*${label}:* ${chatState.userData[key]}%0A`;
            }
        }
        whatsappMessage += serviceData;
    } else {
        whatsappMessage += `Não foi selecionado um serviço específico, mas o contato inicial foi feito através do site.`;
    }
    
    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
    
    // Botão final
    const finalButtonDiv = document.createElement('div');
    finalButtonDiv.className = 'chat-message my-4 flex justify-center';
    finalButtonDiv.innerHTML = `
        <a href="${whatsappLink}" target="_blank" class="btn-primary text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center justify-center transition duration-300 transform hover:scale-105">
            <i class="fab fa-whatsapp mr-2"></i> Enviar Mensagem para Anderson
        </a>
    `;
    chatMessages.appendChild(finalButtonDiv);
    
    addBotMessage(`Clique no botão acima para me enviar as informações pelo WhatsApp e ter um atendimento exclusivo! Obrigado.`);
    
    disableInput(true);
}


// Funções utilitárias
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function disableInput(final = false) {
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    userInput.disabled = true;
    sendButton.disabled = true;
    if (final) {
        userInput.placeholder = 'Atendimento finalizado. Clique no botão do WhatsApp.';
    }
}

function enableInput() {
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initChat();
    
    // Enviar mensagem ao apertar Enter
    document.getElementById('userInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Back to Top functionality
    const homeButton = document.getElementById('homeButton');

    window.onscroll = function() { scrollFunction() };

    function scrollFunction() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            homeButton.style.display = "flex";
            homeButton.style.opacity = "1";
        } else {
            homeButton.style.opacity = "0";
            setTimeout(() => {
                if (document.body.scrollTop <= 300 && document.documentElement.scrollTop <= 300) {
                    homeButton.style.display = "none";
                }
            }, 300); // Delay para coincidir com a transição CSS
        }
    }
});