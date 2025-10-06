let NotifPositionX = 'right';     /* left,center,right */
let NotifPositionY = 'top';   /* bottom,middle,top */
let NotifColorText = '#FFFFFF';
let NotifColorBg = '#00BE3B';

let currentPage = 1;
const itemsPerPage = 20;
const maxGroupsPerPage = 5;
let currentFilterMode = 'all';
let groupedQuestions = [];

const sections = [
    "ФЗ-230",
    "Законодательство",
    "Соблюдение ФЗ 230",
    "Процедуры и инструкции",
    "Процедуры и инструкции РГ",
    "Стандарты обслуживания по телефону",
    "Правила применения аргументации",
    "Правила применения аргументации 1-30",
    "Правила применения аргументации ипотека, авто",
    "Правила применения аргументации 31-150",
    "Правила применения аргументации 150+",
    "Беззалоговые продукты Банка",
    "Залоговые продукты Банка",
    "Инструкция о работе с проблемной задолженностью по кредитам физических лиц",
    "Кейсовая ситуация",
    "Кейсовая ситуация (150+)",
    "СУБО",
    "ВТБ Про",
    "ЦФТ 2.0",
    "OW-Analytic",
    "Одинаковые вопросы"
];

function initNotification() {
    const notification = document.getElementById('copy-notification');
    notification.className = 'copy-notification';
    notification.classList.add(NotifPositionX, NotifPositionY, 'initialized');
    notification.style.color = NotifColorText;
    notification.style.backgroundColor = NotifColorBg;
}

function groupIdenticalQuestions() {
    const groups = {};
    
    questionDatabase.forEach(item => {
        const question = item.question.trim();
        if (!groups[question]) {
            groups[question] = [];
        }
        groups[question].push(item);
    });
    
    return Object.values(groups)
        .sort((a, b) => b.length - a.length)
        .filter(group => group.length > 1);
}

function filterQuestionsBySection(section) {
    return questionDatabase.filter(item => {
        if (section === "ЦФТ 2.0") {
            return item.question.startsWith("ЦФТ 2.0") || 
                   item.question.startsWith("ЦФТ 2.0.");
        }
        const dotIndex = item.question.indexOf('.');
        if (dotIndex === -1) return false;
        
        const prefix = item.question.substring(0, dotIndex).trim();
        return prefix === section;
    });
}

function updateAllPagination() {
    const pageInfo = document.getElementById('page-info');
    const bottomInfo = document.getElementById('bottom-page-info');
    const floatingInfo = document.getElementById('floating-page-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const floatingPrev = document.getElementById('floating-prev');
    const floatingNext = document.getElementById('floating-next');
    const bottomPrev = document.getElementById('bottom-prev-page');
    const bottomNext = document.getElementById('bottom-next-page');
    const topPageManagement = document.querySelector('.top-page-management');
    const bottomPageManagement = document.querySelector('.bottom-page-management');
    const floatingPagination = document.querySelector('.floating-pagination');
    
    let totalPages, currentText, totalItems;
    
    if (currentFilterMode === 'identical') {
        totalItems = groupedQuestions.length;
        totalPages = Math.ceil(totalItems / maxGroupsPerPage);
        currentText = totalPages === 1 ? 
            `Одна страница\n(групп: ${totalItems})` : 
            `Стр. ${currentPage} из ${totalPages}\n(групп: ${totalItems})`;
    } else if (currentFilterMode !== 'all') {
        const filteredQuestions = filterQuestionsBySection(currentFilterMode);
        totalItems = filteredQuestions.length;
        totalPages = Math.ceil(totalItems / itemsPerPage);
        currentText = totalPages === 1 ? 
            `Одна страница\n(${totalItems} вопр.)` : 
            `Стр. ${currentPage} из ${totalPages}\n(${totalItems} вопр.)`;
    } else {
        totalItems = questionDatabase.length;
        totalPages = Math.ceil(totalItems / itemsPerPage);
        currentText = totalPages === 1 ? 
            `Одна страница\n(${totalItems} вопр.)` : 
            `Стр. ${currentPage} из ${totalPages}\n(${totalItems} вопр.)`;
    }
    
    pageInfo.innerHTML = currentText;
    bottomInfo.innerHTML = currentText;
    floatingInfo.textContent = `${currentPage}/${totalPages}`;
    
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;
    
    prevButton.disabled = isFirstPage;
    nextButton.disabled = isLastPage;
    floatingPrev.disabled = isFirstPage;
    floatingNext.disabled = isLastPage;
    bottomPrev.disabled = isFirstPage;
    bottomNext.disabled = isLastPage;

    if (totalPages <= 1) {
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        bottomPrev.style.display = 'none';
        bottomNext.style.display = 'none';
        
        floatingPagination.classList.add('hidden');
    } else {
        prevButton.style.display = 'flex';
        nextButton.style.display = 'flex';
        bottomPrev.style.display = 'flex';
        bottomNext.style.display = 'flex';
        
        floatingPagination.classList.remove('hidden');
    }
    
    topPageManagement.classList.remove('hidden');
    bottomPageManagement.classList.remove('hidden');
	    setTimeout(() => {
        const pageManagement = document.querySelectorAll('.page-management');
        pageManagement.forEach(panel => {
            panel.style.display = 'flex';
        });
    }, 0);
}

function toggleFloatingPagination() {
    const floatingPagination = document.querySelector('.floating-pagination');
    if (floatingPagination.classList.contains('hidden')) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop > 200 && scrollTop + windowHeight < documentHeight - 100) {
        floatingPagination.classList.add('visible');
    } else {
        floatingPagination.classList.remove('visible');
    }
}

function displayQuestions(page) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    
    if (currentFilterMode === 'identical') {
        const startIndex = (page - 1) * maxGroupsPerPage;
        const endIndex = Math.min(startIndex + maxGroupsPerPage, groupedQuestions.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const group = groupedQuestions[i];
            const groupContainer = document.createElement('div');
            groupContainer.className = 'question-group';
            
            const groupHeader = document.createElement('div');
            groupHeader.className = 'group-header';
            groupHeader.textContent = `Вопрос (${group.length} варианта ответа):`;
            groupContainer.appendChild(groupHeader);
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text group-question-text';
            questionText.textContent = group[0].question;
            questionText.setAttribute('data-question', group[0].question);
            groupContainer.appendChild(questionText);
            
            group.forEach((item, index) => {
                const answerContainer = document.createElement('div');
                answerContainer.className = 'answer-container group-item';
                
                const answerHeader = document.createElement('div');
                answerHeader.className = 'answer-header';
                answerHeader.textContent = `Ответ ${index + 1}:`;
                answerContainer.appendChild(answerHeader);
                
                const answerText = document.createElement('div');
                answerText.className = 'answer-text';
                answerText.innerHTML = item.answer.replace(/\n/g, '<br>');
                answerText.setAttribute('data-answer', item.answer);
                answerContainer.appendChild(answerText);
                
                groupContainer.appendChild(answerContainer);
            });
            
            resultsContainer.appendChild(groupContainer);
        }
    } else if (currentFilterMode !== 'all') {
        const filteredQuestions = filterQuestionsBySection(currentFilterMode);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredQuestions.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const item = filteredQuestions[i];
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = item.question;
            questionText.setAttribute('data-question', item.question);
            
            const answerText = document.createElement('div');
            answerText.className = 'answer-text';
            answerText.innerHTML = item.answer.replace(/\n/g, '<br>');
            answerText.setAttribute('data-answer', item.answer);
            
            questionItem.appendChild(questionText);
            questionItem.appendChild(answerText);
            
            resultsContainer.appendChild(questionItem);
        }
    } else {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, questionDatabase.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const item = questionDatabase[i];
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = item.question;
            questionText.setAttribute('data-question', item.question);
            
            const answerText = document.createElement('div');
            answerText.className = 'answer-text';
            answerText.innerHTML = item.answer.replace(/\n/g, '<br>');
            answerText.setAttribute('data-answer', item.answer);
            
            questionItem.appendChild(questionText);
            questionItem.appendChild(answerText);
            
            resultsContainer.appendChild(questionItem);
        }
    }
    
    updateAllPagination();
    addCopyHandlers();
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function addCopyHandlers() {
    const questionTexts = document.querySelectorAll('.question-text');
    const answerTexts = document.querySelectorAll('.answer-text');
    
    questionTexts.forEach(text => {
        text.addEventListener('click', function(e) {
            if (e.target.tagName === 'MARK') return;
            
            const question = this.getAttribute('data-question');
            copyToClipboard(question);
            showCopyNotification('Вопрос скопирован!');
            
            this.classList.add('click-effect');
            setTimeout(() => {
                this.classList.remove('click-effect');
            }, 600);
        });
    });
    
    answerTexts.forEach(text => {
        text.addEventListener('click', function(e) {
            if (e.target.tagName === 'MARK') return;
            
            const answer = this.getAttribute('data-answer');
            copyToClipboard(answer);
            showCopyNotification('Ответ скопирован!');
            
            this.classList.add('click-effect');
            setTimeout(() => {
                this.classList.remove('click-effect');
            }, 600);
        });
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

function showCopyNotification(message) {
    const notification = document.getElementById('copy-notification');
    
    if (!notification.classList.contains('initialized')) {
        notification.className = 'copy-notification';
        notification.classList.add(NotifPositionX, NotifPositionY, 'initialized');
        notification.style.color = NotifColorText;
        notification.style.backgroundColor = NotifColorBg;
    }
    
    if (notification.classList.contains('show')) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.textContent = message;
            notification.classList.add('show');
        }, 300);
    } else {
        notification.textContent = message;
        notification.classList.add('show');
    }
    
    if (window.copyNotificationTimeout) {
        clearTimeout(window.copyNotificationTimeout);
    }
    
    window.copyNotificationTimeout = setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

function changeFilterMode() {
    const filterSelect = document.getElementById('filter-select');
    const selectedValue = filterSelect.value;
    
    if (selectedValue === 'identical') {
        currentFilterMode = 'identical';
        groupedQuestions = groupIdenticalQuestions();
    } else if (selectedValue === 'all') {
        currentFilterMode = 'all';
    } else {
        currentFilterMode = selectedValue;
    }
    
    currentPage = 1;
    displayQuestions(currentPage);
}

function navigateToPage(direction) {
    let maxPage;
    
    if (currentFilterMode === 'identical') {
        maxPage = Math.ceil(groupedQuestions.length / maxGroupsPerPage);
    } else if (currentFilterMode !== 'all') {
        const filteredQuestions = filterQuestionsBySection(currentFilterMode);
        maxPage = Math.ceil(filteredQuestions.length / itemsPerPage);
    } else {
        maxPage = Math.ceil(questionDatabase.length / itemsPerPage);
    }
    
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
        displayQuestions(currentPage);
    } else if (direction === 'next' && currentPage < maxPage) {
        currentPage++;
        displayQuestions(currentPage);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initNotification();
    
    const filterSelect = document.getElementById('filter-select');
    
    sections.forEach(section => {
        if (section !== 'Одинаковые вопросы') {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            filterSelect.appendChild(option);
        }
    });
    
    displayQuestions(currentPage);
    
    filterSelect.addEventListener('change', changeFilterMode);
    
    document.getElementById('prev-page').addEventListener('click', () => navigateToPage('prev'));
    document.getElementById('next-page').addEventListener('click', () => navigateToPage('next'));
    document.getElementById('floating-prev').addEventListener('click', () => navigateToPage('prev'));
    document.getElementById('floating-next').addEventListener('click', () => navigateToPage('next'));
    document.getElementById('bottom-prev-page').addEventListener('click', () => navigateToPage('prev'));
    document.getElementById('bottom-next-page').addEventListener('click', () => navigateToPage('next'));
    
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    window.addEventListener('scroll', toggleFloatingPagination);
    toggleFloatingPagination();
});