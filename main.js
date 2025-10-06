let NotifPositionX = 'right';     /* left,center,right */
let NotifPositionY = 'top';   /* bottom,middle,top */
let NotifColorText = '#FFFFFF';
let NotifColorBg = '#00BE3B';

let initialFragmentsCount = 4;
let maxFragmentsCount = 6;
let maxQuestionsPerPage = 15;

let currentPage = 1;
let searchResults = [];
let searchKeywords = [];

function initNotification() {
    const notification = document.getElementById('copy-notification');
    notification.className = 'copy-notification';
    notification.classList.add(NotifPositionX, NotifPositionY);
    notification.style.color = NotifColorText;
    notification.style.backgroundColor = NotifColorBg;
}

function searchQuestions(keywords) {
    const results = [];
    const nonEmptyKeywords = keywords.filter(keyword => keyword.trim().length > 0);
    
    if (nonEmptyKeywords.length === 0) {
        return results;
    }
    questionDatabase.forEach(item => {
        const question = item.question.toLowerCase();
        let matchesAll = true;
        for (const keyword of nonEmptyKeywords) {
            if (!question.includes(keyword.toLowerCase())) {
                matchesAll = false;
                break;
            }
        }
        
        if (matchesAll) {
            results.push(item);
        }
    });
    
    return results;
}

function groupIdenticalQuestions(questions) {
    const groups = {};
    
    questions.forEach(item => {
        const question = item.question.trim();
        if (!groups[question]) {
            groups[question] = [];
        }
        groups[question].push(item);
    });
    
    return Object.values(groups)
        .sort((a, b) => b.length - a.length);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function highlightText(text, keywords) {
    if (!keywords || keywords.length === 0) return escapeHtml(text);
    
    let highlightedText = escapeHtml(text);
    const nonEmptyKeywords = keywords.filter(keyword => keyword.trim().length > 0);
    
    nonEmptyKeywords.forEach(keyword => {
        if (keyword.trim() !== '') {
            const regex = new RegExp(escapeRegex(keyword), 'gi');
            highlightedText = highlightedText.replace(regex, match => `<mark>${match}</mark>`);
        }
    });
    
    return highlightedText;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function displayResults(results, keywords, page = 1) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = '<h3>Ничего не найдено</h3><p>Скорее всего этого вопроса нет в базе, либо ошибка в фрагмента</p>';
        resultsContainer.appendChild(noResults);
        hidePagination();
        return;
    }
    
    const startIndex = (page - 1) * maxQuestionsPerPage;
    const endIndex = Math.min(startIndex + maxQuestionsPerPage, results.length);
    const paginatedResults = results.slice(startIndex, endIndex);
    
    const groupedResults = groupIdenticalQuestions(paginatedResults);
    
    groupedResults.forEach(group => {
        if (group.length > 1) {
            const groupContainer = document.createElement('div');
            groupContainer.className = 'question-group';
            
            const groupHeader = document.createElement('div');
            groupHeader.className = 'group-header';
            groupHeader.textContent = `Вопрос (${group.length} варианта ответа):`;
            groupContainer.appendChild(groupHeader);
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text group-question-text';
            questionText.innerHTML = highlightText(group[0].question, keywords);
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
                answerText.innerHTML = escapeHtml(item.answer).replace(/\n/g, '<br>');
                answerText.setAttribute('data-answer', item.answer);
                answerContainer.appendChild(answerText);
                
                groupContainer.appendChild(answerContainer);
            });
            
            resultsContainer.appendChild(groupContainer);
        } else {
            group.forEach(item => {
                const questionItem = document.createElement('div');
                questionItem.className = 'question-item';
                
                const questionText = document.createElement('div');
                questionText.className = 'question-text';
                questionText.innerHTML = highlightText(item.question, keywords);
                questionText.setAttribute('data-question', item.question);
                
                const answerText = document.createElement('div');
                answerText.className = 'answer-text';
                answerText.innerHTML = escapeHtml(item.answer).replace(/\n/g, '<br>');
                answerText.setAttribute('data-answer', item.answer);
                
                questionItem.appendChild(questionText);
                questionItem.appendChild(answerText);
                
                resultsContainer.appendChild(questionItem);
            });
        }
    });
    
    updatePagination(results.length, page);
    addCopyHandlers();
}

function updatePagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / maxQuestionsPerPage);
    
    if (totalPages <= 1) {
        hidePagination();
        return;
    }
    
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
    
    const currentText = totalPages === 1 ? 
        `Одна страница\n(${totalItems} вопр.)` : 
        `Стр. ${currentPage} из ${totalPages}\n(${totalItems} вопр.)`;
    
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

    topPageManagement.classList.remove('hidden');
    bottomPageManagement.classList.remove('hidden');
    floatingPagination.classList.remove('hidden');
    
    setTimeout(() => {
        const pageManagement = document.querySelectorAll('.page-management');
        pageManagement.forEach(panel => {
            panel.style.display = 'flex';
        });
    }, 0);
}

function hidePagination() {
    const topPageManagement = document.querySelector('.top-page-management');
    const bottomPageManagement = document.querySelector('.bottom-page-management');
    const floatingPagination = document.querySelector('.floating-pagination');
    
    topPageManagement.classList.add('hidden');
    bottomPageManagement.classList.add('hidden');
    floatingPagination.classList.add('hidden');
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

function updateInputControls() {
    const inputCount = document.querySelectorAll('.keyword-input').length;
    document.getElementById('remove-input-button').disabled = inputCount <= 1;
    document.getElementById('add-input-button').disabled = inputCount >= maxFragmentsCount;
}

function addKeywordInput() {
    const container = document.getElementById('keyword-inputs-container');
    if (container.children.length >= maxFragmentsCount) return;
    
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'keyword-input';
    newInput.placeholder = `Фрагмент ${container.children.length + 1}`;
    newInput.autocomplete = 'off';
    
    newInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    container.appendChild(newInput);
    updateInputControls();
}

function removeKeywordInput() {
    const container = document.getElementById('keyword-inputs-container');
    if (container.children.length <= 1) return;
    
    container.removeChild(container.lastChild);
    updateInputControls();
}

function navigateToPage(direction) {
    const maxPage = Math.ceil(searchResults.length / maxQuestionsPerPage);
    
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
        displayResults(searchResults, searchKeywords, currentPage);
    } else if (direction === 'next' && currentPage < maxPage) {
        currentPage++;
        displayResults(searchResults, searchKeywords, currentPage);
    }
    
    window.scrollTo({
        top: document.getElementById('results').offsetTop - 20,
        behavior: 'smooth'
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initNotification();
    
    document.getElementById('questions-count').textContent = questionDatabase.length;
    
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', handleSearch);
    
    document.getElementById('database-button').addEventListener('click', () => {
        window.location.href = 'base.html';
    });
    
    document.getElementById('add-input-button').addEventListener('click', addKeywordInput);
    document.getElementById('remove-input-button').addEventListener('click', removeKeywordInput);
    
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement.classList.contains('keyword-input')) {
                handleSearch();
                e.preventDefault();
            }
        }
    });
    
    for (let i = 1; i < initialFragmentsCount; i++) {
        addKeywordInput();
    }
    updateInputControls();
    
    function handleSearch() {
        const inputs = document.querySelectorAll('.keyword-input');
        const keywords = Array.from(inputs).map(input => input.value.trim());
        
        searchResults = searchQuestions(keywords);
        searchKeywords = keywords;
        currentPage = 1;
        
        displayResults(searchResults, keywords, currentPage);
        
        inputs.forEach(input => {
            input.value = '';
        });
        document.querySelector('.keyword-input').focus();
        
        window.scrollTo({
            top: document.getElementById('results').offsetTop - 20,
            behavior: 'smooth'
        });
    }
    
    document.querySelector('.keyword-input').focus();
    
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    document.getElementById('prev-page').addEventListener('click', () => navigateToPage('prev'));
    document.getElementById('next-page').addEventListener('click', () => navigateToPage('next'));
    document.getElementById('floating-prev').addEventListener('click', () => navigateToPage('prev'));
    document.getElementById('floating-next').addEventListener('click', () => navigateToPage('next'));
    document.getElementById('bottom-prev-page').addEventListener('click', () => navigateToPage('prev'));
    document.getElementById('bottom-next-page').addEventListener('click', () => navigateToPage('next'));
    
    window.addEventListener('scroll', toggleFloatingPagination);
    toggleFloatingPagination();
});