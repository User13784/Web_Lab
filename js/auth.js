const API_URL = 'http://localhost:3000';

const TOP_PASSWORDS = [
    'password', '123456', '123456789', 'qwerty', 'password123', '12345678', '111111',
    '12345', '1234567890', 'qwerty123', 'abc123', 'admin', 'iloveyou', 'welcome',
    'monkey', 'dragon', 'master', 'hello', 'freedom', 'whatever', 'qwertyuiop',
    'passw0rd', 'letmein', 'trustno1', '123123', 'admin123', 'password1', 'adminadmin'
];

const NICKNAME_SUFFIXES = ['', 'Cool', 'Pro', 'Star', 'Good', 'Super', 'Ultra', 'Mega'];

let generateAttempts = 0;
const MAX_GENERATE_ATTEMPTS = 5;
let isManualNicknameMode = false;
let currentUser = null;

let currentFormValidity = {
    isPhoneValid: false,
    isEmailValid: false,
    isBirthValid: false,
    isFirstNameValid: false,
    isLastNameValid: false,
    isNicknameValid: false,
    isPasswordValid: false,
    isConfirmValid: false,
    isAgreementValid: false,
    isNicknameUnique: false
};

function showMessage(message, type = 'info') {
    const existingMsg = document.querySelector('.message-popup');
    if (existingMsg) existingMsg.remove();
    
    const msg = document.createElement('div');
    msg.className = `message-popup ${type === 'error' ? 'error' : (type === 'success' ? 'success' : '')}`;
    msg.textContent = message;
    document.body.appendChild(msg);
    
    setTimeout(() => msg.remove(), 3000);
}

function validatePhone(phone) {
    const phoneRegex = /^(\+375|375)(29|33|44|25|17)\d{7}$/;
    return phoneRegex.test(phone);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
}

function validateNickname(nickname) {
    const nicknameRegex = /^[A-Za-z0-9_\-\.]{3,30}$/;
    return nicknameRegex.test(nickname);
}

function isOnlyEnglishLetters(text) {
    const englishOnlyRegex = /^[A-Za-z0-9_\-\.]*$/;
    return englishOnlyRegex.test(text);
}

function getAgeFromBirthDate(birthDate) {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

function updateAgeHint() {
    const birthDateInput = document.getElementById('regBirthDate');
    const birthDate = birthDateInput?.value;
    
    const oldHint = document.querySelector('.age-hint');
    if (oldHint) oldHint.remove();
    
    if (!birthDate) {
        const hint = document.createElement('div');
        hint.className = 'age-hint info';
        hint.innerHTML = 'ℹ️ <strong>Минимальный возраст для регистрации: 16 лет</strong>';
        birthDateInput?.parentNode.appendChild(hint);
        return;
    }
    
    const age = getAgeFromBirthDate(birthDate);
    
    if (age !== null) {
        const hint = document.createElement('div');
        
        if (age >= 16) {
            hint.className = 'age-hint success';
            hint.innerHTML = `✅ <strong>Возраст: ${age} лет</strong> - соответствует требованиям`;
        } else {
            hint.className = 'age-hint warning';
            hint.innerHTML = `⚠️ <strong>Возраст: ${age} лет</strong> - требуется не менее 16 лет`;
        }
        
        birthDateInput?.parentNode.appendChild(hint);
    }
}

function validateBirthDate(birthDate) {
    const age = getAgeFromBirthDate(birthDate);
    return age !== null && age >= 16;
}

function isTopPassword(password) {
    return TOP_PASSWORDS.includes(password.toLowerCase());
}

function validatePassword(password) {
    const minLength = password.length >= 8;
    const maxLength = password.length <= 20;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const notTopPassword = !isTopPassword(password);
    
    return {
        isValid: minLength && maxLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial && notTopPassword,
        errors: {
            minLength: !minLength,
            maxLength: !maxLength,
            hasUpperCase: !hasUpperCase,
            hasLowerCase: !hasLowerCase,
            hasNumber: !hasNumber,
            hasSpecial: !hasSpecial,
            notTopPassword: !notTopPassword
        }
    };
}

async function generateUniqueNickname(firstName, lastName) {
    function transliterate(text) {
        const ru = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
            'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return text.toLowerCase().split('').map(char => ru[char] || char).join('');
    }
    
    const latinFirstName = transliterate(firstName);
    const latinLastName = transliterate(lastName);
    
    if (!latinFirstName || !latinLastName) {
        return generateRandomNickname();
    }
    
    for (let attempt = 0; attempt < 20; attempt++) {
        const namePart = latinFirstName.substring(0, Math.floor(Math.random() * 3) + 1);
        const lastNamePart = latinLastName.substring(0, Math.floor(Math.random() * 3) + 1);
        const randomNum = Math.floor(Math.random() * 990) + 10;
        const suffix = NICKNAME_SUFFIXES[Math.floor(Math.random() * NICKNAME_SUFFIXES.length)];
        
        let nickname = namePart.charAt(0).toUpperCase() + namePart.slice(1) + 
                       lastNamePart.charAt(0).toUpperCase() + lastNamePart.slice(1) + randomNum;
        if (suffix) nickname += suffix;
        
        const isUnique = await checkNicknameUnique(nickname);
        if (isUnique) {
            return nickname;
        }
    }
    
    return `${latinFirstName.substring(0, 2)}${latinLastName.substring(0, 2)}${Date.now() % 10000}`;
}

function generateRandomNickname() {
    const prefixes = ['User', 'Guest', 'Member', 'Client'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    return `${prefix}${randomNum}`;
}

async function checkNicknameUnique(nickname) {
    try {
        const response = await fetch(`${API_URL}/users?nickname=${nickname}`);
        const users = await response.json();
        return users.length === 0;
    } catch (error) {
        console.error('Ошибка проверки никнейма:', error);
        return true;
    }
}

async function checkEmailUnique(email) {
    try {
        const response = await fetch(`${API_URL}/users?email=${email}`);
        const users = await response.json();
        return users.length === 0;
    } catch (error) {
        console.error('Ошибка проверки email:', error);
        return true;
    }
}

async function checkPhoneUnique(phone) {
    try {
        const response = await fetch(`${API_URL}/users?phone=${phone}`);
        const users = await response.json();
        return users.length === 0;
    } catch (error) {
        console.error('Ошибка проверки телефона:', error);
        return true;
    }
}

function showFieldError(errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
}

function hideFieldError(errorId) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
        errorEl.classList.remove('show');
    }
}

function updateRegisterButtonState() {
    const submitBtn = document.getElementById('registerSubmitBtn');
    if (!submitBtn) return;
    
    const isValid = currentFormValidity.isPhoneValid &&
                    currentFormValidity.isEmailValid &&
                    currentFormValidity.isBirthValid &&
                    currentFormValidity.isFirstNameValid &&
                    currentFormValidity.isLastNameValid &&
                    currentFormValidity.isNicknameValid &&
                    currentFormValidity.isNicknameUnique &&
                    currentFormValidity.isPasswordValid &&
                    currentFormValidity.isConfirmValid &&
                    currentFormValidity.isAgreementValid;
    
    submitBtn.disabled = !isValid;
    return isValid;
}

async function checkNicknameUniqueness(nickname) {
    if (!nickname || nickname.length < 3) {
        currentFormValidity.isNicknameUnique = false;
        updateRegisterButtonState();
        return false;
    }
    const isUnique = await checkNicknameUnique(nickname);
    currentFormValidity.isNicknameUnique = isUnique;
    
    if (!isUnique) {
        const nicknameError = document.getElementById('nicknameError');
        if (nicknameError) {
            nicknameError.textContent = 'Такой никнейм уже существует, попробуйте другой';
            nicknameError.classList.add('show');
        }
        document.getElementById('regNickname')?.classList.add('error');
        currentFormValidity.isNicknameValid = false;
    } else {
        hideFieldError('nicknameError');
        document.getElementById('regNickname')?.classList.remove('error');
        currentFormValidity.isNicknameValid = true;
    }
    
    updateRegisterButtonState();
    return isUnique;
}

function restrictNicknameInput() {
    const nicknameInput = document.getElementById('regNickname');
    if (!nicknameInput) return;
    
    nicknameInput.addEventListener('input', function(e) {
        const originalValue = this.value;
        const filteredValue = originalValue.replace(/[^A-Za-z0-9_\-\.]/g, '');
        
        if (originalValue !== filteredValue) {
            this.value = filteredValue;
            showFieldError('nicknameError', 'Никнейм может содержать только английские буквы (A-Z, a-z), цифры (0-9) и символы _, -, .');
            currentFormValidity.isNicknameValid = false;
        } else {
            hideFieldError('nicknameError');
        }
        
        validateRegistrationFormSync();
    });
}

function validateRegistrationFormSync() {
    const phone = document.getElementById('regPhone')?.value || '';
    const email = document.getElementById('regEmail')?.value || '';
    const birthDate = document.getElementById('regBirthDate')?.value || '';
    const firstName = document.getElementById('regFirstName')?.value || '';
    const lastName = document.getElementById('regLastName')?.value || '';
    const nickname = document.getElementById('regNickname')?.value || '';
    const agreement = document.getElementById('agreement')?.checked || false;
    
    const passwordMethod = document.querySelector('input[name="passwordMethod"]:checked')?.value;
    let password = '';
    let confirmPassword = '';
    
    if (passwordMethod === 'manual') {
        password = document.getElementById('regPassword')?.value || '';
        confirmPassword = document.getElementById('regConfirmPassword')?.value || '';
    } else {
        password = document.getElementById('autoPassword')?.value || '';
    }
    
    let isValid = true;
    
    if (!validatePhone(phone)) {
        showFieldError('phoneError', 'Введите корректный номер телефона РБ (+375XXXXXXXXX или 375XXXXXXXXX)');
        document.getElementById('regPhone')?.classList.add('error');
        currentFormValidity.isPhoneValid = false;
        isValid = false;
    } else {
        hideFieldError('phoneError');
        document.getElementById('regPhone')?.classList.remove('error');
        currentFormValidity.isPhoneValid = true;
    }
    
    if (!validateEmail(email)) {
        showFieldError('emailError', 'Введите корректный email адрес');
        document.getElementById('regEmail')?.classList.add('error');
        currentFormValidity.isEmailValid = false;
        isValid = false;
    } else {
        hideFieldError('emailError');
        document.getElementById('regEmail')?.classList.remove('error');
        currentFormValidity.isEmailValid = true;
    }
    
    if (!birthDate) {
        showFieldError('birthError', 'Укажите дату рождения');
        document.getElementById('regBirthDate')?.classList.add('error');
        currentFormValidity.isBirthValid = false;
        isValid = false;
    } else if (!validateBirthDate(birthDate)) {
        const age = getAgeFromBirthDate(birthDate);
        showFieldError('birthError', `Вам должно быть не менее 16 лет (сейчас ${age} лет)`);
        document.getElementById('regBirthDate')?.classList.add('error');
        currentFormValidity.isBirthValid = false;
        isValid = false;
    } else {
        hideFieldError('birthError');
        document.getElementById('regBirthDate')?.classList.remove('error');
        currentFormValidity.isBirthValid = true;
    }
    
    if (!firstName.trim()) {
        showFieldError('firstNameError', 'Укажите имя');
        document.getElementById('regFirstName')?.classList.add('error');
        currentFormValidity.isFirstNameValid = false;
        isValid = false;
    } else {
        hideFieldError('firstNameError');
        document.getElementById('regFirstName')?.classList.remove('error');
        currentFormValidity.isFirstNameValid = true;
    }
    
    if (!lastName.trim()) {
        showFieldError('lastNameError', 'Укажите фамилию');
        document.getElementById('regLastName')?.classList.add('error');
        currentFormValidity.isLastNameValid = false;
        isValid = false;
    } else {
        hideFieldError('lastNameError');
        document.getElementById('regLastName')?.classList.remove('error');
        currentFormValidity.isLastNameValid = true;
    }
    
    if (!nickname.trim()) {
        showFieldError('nicknameError', 'Укажите никнейм');
        document.getElementById('regNickname')?.classList.add('error');
        currentFormValidity.isNicknameValid = false;
        isValid = false;
    } else if (nickname.length < 3) {
        showFieldError('nicknameError', 'Никнейм должен содержать минимум 3 символа');
        document.getElementById('regNickname')?.classList.add('error');
        currentFormValidity.isNicknameValid = false;
        isValid = false;
    } else if (nickname.length > 30) {
        showFieldError('nicknameError', 'Никнейм должен содержать не более 30 символов');
        document.getElementById('regNickname')?.classList.add('error');
        currentFormValidity.isNicknameValid = false;
        isValid = false;
    } else if (!validateNickname(nickname)) {
        showFieldError('nicknameError', 'Никнейм может содержать только английские буквы (A-Z, a-z), цифры (0-9) и символы _, -, .');
        document.getElementById('regNickname')?.classList.add('error');
        currentFormValidity.isNicknameValid = false;
        isValid = false;
    } else if (!isOnlyEnglishLetters(nickname)) {
        showFieldError('nicknameError', 'Никнейм может содержать только английские буквы! Русские буквы запрещены.');
        document.getElementById('regNickname')?.classList.add('error');
        currentFormValidity.isNicknameValid = false;
        isValid = false;
    } else {
        hideFieldError('nicknameError');
        document.getElementById('regNickname')?.classList.remove('error');
        currentFormValidity.isNicknameValid = true;
        checkNicknameUniqueness(nickname);
    }
    
    if (passwordMethod === 'manual') {
        const validation = validatePassword(password);
        if (!validation.isValid) {
            let errorText = 'Пароль должен содержать: ';
            const errors = [];
            if (validation.errors.minLength) errors.push('минимум 8 символов');
            if (validation.errors.maxLength) errors.push('не более 20 символов');
            if (validation.errors.hasUpperCase) errors.push('заглавную букву');
            if (validation.errors.hasLowerCase) errors.push('строчную букву');
            if (validation.errors.hasNumber) errors.push('цифру');
            if (validation.errors.hasSpecial) errors.push('специальный символ');
            if (validation.errors.notTopPassword) errors.push('не входить в топ-100 паролей');
            showFieldError('passwordError', errorText + errors.join(', '));
            document.getElementById('regPassword')?.classList.add('error');
            currentFormValidity.isPasswordValid = false;
            isValid = false;
        } else {
            hideFieldError('passwordError');
            document.getElementById('regPassword')?.classList.remove('error');
            currentFormValidity.isPasswordValid = true;
        }
        
        if (password !== confirmPassword) {
            showFieldError('confirmError', 'Пароли не совпадают');
            document.getElementById('regConfirmPassword')?.classList.add('error');
            currentFormValidity.isConfirmValid = false;
            isValid = false;
        } else {
            hideFieldError('confirmError');
            document.getElementById('regConfirmPassword')?.classList.remove('error');
            currentFormValidity.isConfirmValid = true;
        }
    } else {
        currentFormValidity.isPasswordValid = true;
        currentFormValidity.isConfirmValid = true;
    }
    
    if (!agreement) {
        showFieldError('agreementError', 'Необходимо принять Соглашение пользователя');
        currentFormValidity.isAgreementValid = false;
        isValid = false;
    } else {
        hideFieldError('agreementError');
        currentFormValidity.isAgreementValid = true;
    }
    
    updateRegisterButtonState();
    return isValid;
}

async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/users?email=${email}`);
        const users = await response.json();
        
        if (users.length === 0) {
            showMessage('Пользователь с таким email не найден', 'error');
            return false;
        }
        
        const user = users[0];
        if (user.password !== password) {
            showMessage('Неверный пароль', 'error');
            return false;
        }
        
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            nickname: user.nickname,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
        }));
        
        currentUser = user;
        showMessage(`Добро пожаловать, ${user.firstName}!`, 'success');
        
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'catalog.html';
            }
        }, 1500);
        
        return true;
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        showMessage('Ошибка сервера', 'error');
        return false;
    }
}

async function registerUser(userData) {
    try {
        const isEmailUnique = await checkEmailUnique(userData.email);
        if (!isEmailUnique) {
            showMessage('Пользователь с таким email уже существует', 'error');
            return false;
        }
        
        const isPhoneUnique = await checkPhoneUnique(userData.phone);
        if (!isPhoneUnique) {
            showMessage('Пользователь с таким номером телефона уже существует', 'error');
            return false;
        }
        
        const isNicknameUnique = await checkNicknameUnique(userData.nickname);
        if (!isNicknameUnique) {
            showMessage('Такой никнейм уже занят, попробуйте другой', 'error');
            return false;
        }
        
        const newUser = {
            id: Date.now(),
            phone: userData.phone,
            email: userData.email,
            birthDate: userData.birthDate,
            firstName: userData.firstName,
            lastName: userData.lastName,
            patronymic: userData.patronymic || '',
            nickname: userData.nickname,
            password: userData.password,
            role: 'user',
            agreementAccepted: true,
            createdAt: new Date().toISOString()
        };
        
        console.log('Отправка данных пользователя:', newUser);
        
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка регистрации: ${response.status} ${errorText}`);
        }
        
        const savedUser = await response.json();
        console.log('Пользователь успешно сохранен:', savedUser);
        
        showMessage('Регистрация успешна! Теперь вы можете войти', 'success');
        
        document.getElementById('registerFormContent')?.reset();
        
        setTimeout(() => {
            showLoginForm();
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        }, 2000);
        
        return true;
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showMessage(`Ошибка при регистрации: ${error.message}`, 'error');
        return false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const isValid = validateRegistrationFormSync();
    if (!isValid) {
        showMessage('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }
    
    if (!currentFormValidity.isNicknameUnique) {
        showMessage('Проверка уникальности никнейма... Подождите или измените никнейм', 'error');
        return;
    }
    
    const passwordMethod = document.querySelector('input[name="passwordMethod"]:checked')?.value;
    let password = '';
    
    if (passwordMethod === 'manual') {
        password = document.getElementById('regPassword').value;
    } else {
        password = document.getElementById('autoPassword').value;
    }
    
    const userData = {
        phone: document.getElementById('regPhone').value,
        email: document.getElementById('regEmail').value,
        birthDate: document.getElementById('regBirthDate').value,
        firstName: document.getElementById('regFirstName').value.trim(),
        lastName: document.getElementById('regLastName').value.trim(),
        patronymic: document.getElementById('regPatronymic').value.trim() || '',
        nickname: document.getElementById('regNickname').value.trim(),
        password: password,
        agreementAccepted: true
    };
    
    await registerUser(userData);
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('Заполните все поля', 'error');
        return;
    }
    
    await loginUser(email, password);
}

function showRegisterForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (loginTab) loginTab.classList.remove('active');
    if (registerTab) registerTab.classList.add('active');
    
    resetGenerateAttempts();
    updateAgeHint();
    validateRegistrationFormSync();
}

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (registerTab) registerTab.classList.remove('active');
    if (loginTab) loginTab.classList.add('active');
}

function togglePasswordMethod() {
    const method = document.querySelector('input[name="passwordMethod"]:checked')?.value;
    const manualGroup = document.getElementById('manualPasswordGroup');
    const autoGroup = document.getElementById('autoPasswordGroup');
    
    if (method === 'manual') {
        if (manualGroup) manualGroup.style.display = 'block';
        if (autoGroup) autoGroup.style.display = 'none';
    } else {
        if (manualGroup) manualGroup.style.display = 'none';
        if (autoGroup) autoGroup.style.display = 'block';
        generateAutoPassword();
    }
    
    validateRegistrationFormSync();
}

function generateAutoPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    password += 'A';
    password += 'a';
    password += '1';
    password += '!';
    
    for (let i = 4; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    const autoPasswordInput = document.getElementById('autoPassword');
    if (autoPasswordInput) autoPasswordInput.value = password;
}

async function generateNickname() {
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    
    if (!firstName || !lastName) {
        showMessage('Сначала введите имя и фамилию для генерации никнейма', 'error');
        return;
    }
    
    if (generateAttempts >= MAX_GENERATE_ATTEMPTS) {
        showMessage('Вы исчерпали 5 попыток генерации. Теперь вы можете ввести никнейм вручную', 'error');
        enableManualNicknameInput();
        return;
    }
    
    generateAttempts++;
    const attemptsLeft = MAX_GENERATE_ATTEMPTS - generateAttempts;
    const attemptsInfo = document.getElementById('attemptsInfo');
    
    if (attemptsInfo) {
        attemptsInfo.textContent = `Осталось попыток генерации: ${attemptsLeft}`;
    }
    
    if (generateAttempts >= MAX_GENERATE_ATTEMPTS) {
        enableManualNicknameInput();
    }
    
    const newNickname = await generateUniqueNickname(firstName, lastName);
    const nicknameInput = document.getElementById('regNickname');
    if (nicknameInput) nicknameInput.value = newNickname;
    
    const isUnique = await checkNicknameUnique(newNickname);
    if (!isUnique) {
        showMessage('Сгенерированный никнейм уже занят, попробуйте еще раз', 'error');
        currentFormValidity.isNicknameUnique = false;
    } else {
        showMessage(`Сгенерирован новый никнейм: ${newNickname}`, 'success');
        currentFormValidity.isNicknameUnique = true;
        currentFormValidity.isNicknameValid = true;
        hideFieldError('nicknameError');
        if (nicknameInput) nicknameInput.classList.remove('error');
    }
    
    validateRegistrationFormSync();
}

function enableManualNicknameInput() {
    isManualNicknameMode = true;
    const nicknameInput = document.getElementById('regNickname');
    const generateBtn = document.getElementById('generateNicknameBtn');
    
    if (nicknameInput) {
        nicknameInput.readOnly = false;
        nicknameInput.placeholder = 'Введите никнейм вручную (только английские буквы)';
        if (!nicknameInput.value) {
            nicknameInput.value = '';
        }
    }
    
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.5';
        generateBtn.style.cursor = 'not-allowed';
        generateBtn.title = 'Попытки генерации исчерпаны';
    }
    
    const attemptsInfo = document.getElementById('attemptsInfo');
    if (attemptsInfo) {
        attemptsInfo.textContent = '⚠️ Попытки генерации исчерпаны. Введите никнейм вручную (только английские буквы)';
        attemptsInfo.style.color = '#e74c3c';
    }
}

function resetGenerateAttempts() {
    generateAttempts = 0;
    isManualNicknameMode = false;
    
    const nicknameInput = document.getElementById('regNickname');
    const generateBtn = document.getElementById('generateNicknameBtn');
    
    if (nicknameInput) {
        nicknameInput.readOnly = true;
        nicknameInput.placeholder = 'Будет сгенерирован автоматически';
        nicknameInput.value = '';
    }
    
    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
        generateBtn.title = '';
    }
    
    const attemptsInfo = document.getElementById('attemptsInfo');
    if (attemptsInfo) {
        attemptsInfo.textContent = 'Осталось попыток генерации: 5';
        attemptsInfo.style.color = '#5a7c85';
    }
    
    currentFormValidity.isNicknameValid = false;
    currentFormValidity.isNicknameUnique = false;
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

function setupRealTimeValidation() {
    const inputs = ['regPhone', 'regEmail', 'regBirthDate', 'regFirstName', 'regLastName', 'regNickname', 'regPassword', 'regConfirmPassword'];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                const errorId = inputId.replace('reg', '').toLowerCase() + 'Error';
                const errorEl = document.getElementById(errorId);
                if (errorEl) {
                    errorEl.classList.remove('show');
                }
                input.classList.remove('error');
                
                validateRegistrationFormSync();
                
                if (inputId === 'regBirthDate') {
                    updateAgeHint();
                }
                
                if (inputId === 'regNickname' && input.value.length >= 3) {
                    checkNicknameUniqueness(input.value);
                }
            });
            
            input.addEventListener('blur', () => {
                validateRegistrationFormSync();
                if (inputId === 'regNickname' && input.value.length >= 3) {
                    checkNicknameUniqueness(input.value);
                }
            });
        }
    });
    
    const agreement = document.getElementById('agreement');
    if (agreement) {
        agreement.addEventListener('change', () => {
            validateRegistrationFormSync();
        });
    }
    
    const passwordMethodRadios = document.querySelectorAll('input[name="passwordMethod"]');
    passwordMethodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            validateRegistrationFormSync();
        });
    });
    
    const regPassword = document.getElementById('regPassword');
    const regConfirmPassword = document.getElementById('regConfirmPassword');
    
    if (regPassword) {
        regPassword.addEventListener('input', () => {
            validateRegistrationFormSync();
        });
    }
    
    if (regConfirmPassword) {
        regConfirmPassword.addEventListener('input', () => {
            validateRegistrationFormSync();
        });
    }
    
    restrictNicknameInput();
}

function checkAdminMenu() {
    const savedUser = localStorage.getItem('currentUser');
    const adminMenuItem = document.getElementById('adminMenuItem');
    const profileMenuItem = document.getElementById('profileMenuItem');
    
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
            if (adminMenuItem) adminMenuItem.style.display = 'block';
            if (profileMenuItem) profileMenuItem.style.display = 'none';
        } else {
            if (adminMenuItem) adminMenuItem.style.display = 'none';
            if (profileMenuItem) profileMenuItem.style.display = 'block';
        }
    } else {
        if (adminMenuItem) adminMenuItem.style.display = 'none';
        if (profileMenuItem) profileMenuItem.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница регистрации загружена');
    
    checkAdminMenu();
    
    const loginForm = document.getElementById('loginFormContent');
    const registerForm = document.getElementById('registerFormContent');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    if (loginTab) loginTab.addEventListener('click', showLoginForm);
    if (registerTab) registerTab.addEventListener('click', showRegisterForm);
    
    const passwordMethodRadios = document.querySelectorAll('input[name="passwordMethod"]');
    passwordMethodRadios.forEach(radio => {
        radio.addEventListener('change', togglePasswordMethod);
    });
    
    const generateBtn = document.getElementById('generateNicknameBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateNickname);
    }
    
    setupRealTimeValidation();
    
    generateAutoPassword();
    updateAgeHint();
    
    currentFormValidity = {
        isPhoneValid: false,
        isEmailValid: false,
        isBirthValid: false,
        isFirstNameValid: false,
        isLastNameValid: false,
        isNicknameValid: false,
        isPasswordValid: false,
        isConfirmValid: false,
        isAgreementValid: false,
        isNicknameUnique: false
    };
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    const submitBtn = document.getElementById('registerSubmitBtn');
    if (submitBtn) submitBtn.disabled = true;
});

window.togglePasswordVisibility = togglePasswordVisibility;
window.generateNickname = generateNickname;
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;