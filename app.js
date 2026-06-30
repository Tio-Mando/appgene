// ==========================================================
// SUPABASE CLIENT INITIALIZATION & CREDENTIALS
// ==========================================================
const supabaseUrl = 'https://faxxeewhbhmlxbckurxl.supabase.co';
const supabaseKey = 'sb_publishable_eH569-f672z_FhbDMqC_QA_h7FLBTuI';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// State wrapper locally cached to render components instantly
let state = {
    patients: [],
    appointments: [],
    currentPatientId: null,
    currentAppointmentId: null,
    currentDate: new Date(),
    theme: localStorage.getItem('appgene_theme') || 'light',
    dashboardDeleteMode: false,
    promptedAppointments: [],
    user: null,
    clinicSettings: {
        doctor_name: 'Dra. Especialista',
        clinic_address: 'Consultorio Clínico',
        owner_phone: ''
    },
    notifications: []
};

let lastPatientsCount = 0;

// ==========================================================
// CUSTOM STYLISH ALERTS & CONFIRMATIONS (REPLACING BROWSER DEFAULT DEVIANT DIALOGS)
// ==========================================================
window.alert = function(message, title = "Aviso") {
    const modal = document.getElementById('modal-confirm');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const btnCancel = document.getElementById('btn-confirm-cancel');
    const btnAccept = document.getElementById('btn-confirm-accept');
    const iconContainer = document.getElementById('confirm-icon-container');
    const optionsContainer = document.getElementById('confirm-options-container');

    if (!modal) return;

    // Limpiar contenedor de opciones extras
    if (optionsContainer) {
        optionsContainer.style.display = 'none';
        optionsContainer.innerHTML = '';
    }

    // Configurar iconos y textos
    iconContainer.innerHTML = `<i data-lucide="info" style="width: 48px; height: 48px; stroke-width: 1.5;"></i>`;
    iconContainer.style.color = "var(--color-primary)";
    titleEl.textContent = title;
    messageEl.textContent = message;
    messageEl.style.whiteSpace = 'pre-wrap';
    messageEl.style.textAlign = message.includes('\n') ? 'left' : 'center';
    
    // Ocultar botón de cancelar para un simple Alert
    btnCancel.style.display = 'none';
    btnAccept.style.display = 'inline-block';
    btnAccept.textContent = "Aceptar";
    btnAccept.style.background = "var(--color-primary)";
    
    modal.style.display = 'flex';
    lucide.createIcons();

    return new Promise((resolve) => {
        btnAccept.onclick = () => {
            modal.style.display = 'none';
            resolve();
        };
    });
};

window.confirm = function(message, title = "Confirmar Acción") {
    const modal = document.getElementById('modal-confirm');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const btnCancel = document.getElementById('btn-confirm-cancel');
    const btnAccept = document.getElementById('btn-confirm-accept');
    const iconContainer = document.getElementById('confirm-icon-container');
    const optionsContainer = document.getElementById('confirm-options-container');

    if (!modal) return;

    // Limpiar contenedor de opciones extras
    if (optionsContainer) {
        optionsContainer.style.display = 'none';
        optionsContainer.innerHTML = '';
    }

    // Configurar iconos y textos
    iconContainer.innerHTML = `<i data-lucide="help-circle" style="width: 48px; height: 48px; stroke-width: 1.5;"></i>`;
    iconContainer.style.color = "var(--color-warning)";
    titleEl.textContent = title;
    messageEl.textContent = message;
    messageEl.style.whiteSpace = 'pre-wrap';
    messageEl.style.textAlign = message.includes('\n') ? 'left' : 'center';
    
    // Mostrar botones
    btnCancel.style.display = 'inline-block';
    btnAccept.style.display = 'inline-block';
    btnAccept.textContent = "Confirmar";
    btnAccept.style.background = "var(--color-danger)";
    
    modal.style.display = 'flex';
    lucide.createIcons();

    return new Promise((resolve) => {
        btnAccept.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };
        btnCancel.onclick = () => {
            modal.style.display = 'none';
            resolve(false);
        };
    });
};

window.alertWithOptions = function(message, title = "Aviso", extraButtons = []) {
    const modal = document.getElementById('modal-confirm');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const btnCancel = document.getElementById('btn-confirm-cancel');
    const btnAccept = document.getElementById('btn-confirm-accept');
    const iconContainer = document.getElementById('confirm-icon-container');
    const optionsContainer = document.getElementById('confirm-options-container');

    if (!modal) return Promise.resolve(null);

    // Configurar iconos y textos
    iconContainer.innerHTML = `<i data-lucide="info" style="width: 48px; height: 48px; stroke-width: 1.5;"></i>`;
    iconContainer.style.color = "var(--color-primary)";
    titleEl.textContent = title;
    messageEl.textContent = message;
    messageEl.style.whiteSpace = 'pre-wrap';
    messageEl.style.textAlign = message.includes('\n') ? 'left' : 'center';

    // Ocultar botón de cancelar para un simple Alert
    btnCancel.style.display = 'none';
    btnAccept.style.display = 'inline-block';
    btnAccept.textContent = "Aceptar";
    btnAccept.style.background = "var(--color-primary)";

    if (extraButtons.length > 0) {
        optionsContainer.innerHTML = extraButtons.map((btn, index) => {
            return `<button class="btn-primary" style="background: var(--color-accent); color: white; padding: 10px; width: 100%; border-radius: var(--radius-sm); border: none; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;" data-extra-btn-index="${index}">${btn.text}</button>`;
        }).join('');
        optionsContainer.style.display = 'flex';
    } else {
        optionsContainer.style.display = 'none';
        optionsContainer.innerHTML = '';
    }

    modal.style.display = 'flex';
    lucide.createIcons();

    return new Promise((resolve) => {
        btnAccept.onclick = () => {
            modal.style.display = 'none';
            optionsContainer.style.display = 'none';
            optionsContainer.innerHTML = '';
            resolve('accept');
        };

        if (extraButtons.length > 0) {
            const elButtons = optionsContainer.querySelectorAll('button');
            elButtons.forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.getAttribute('data-extra-btn-index'));
                    modal.style.display = 'none';
                    optionsContainer.style.display = 'none';
                    optionsContainer.innerHTML = '';
                    resolve(extraButtons[idx].value);
                };
            });
        }
    });
};

window.promptSlots = function(message, slots, title = "Seleccionar Horario") {
    const modal = document.getElementById('modal-confirm');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const btnCancel = document.getElementById('btn-confirm-cancel');
    const btnAccept = document.getElementById('btn-confirm-accept');
    const iconContainer = document.getElementById('confirm-icon-container');
    const optionsContainer = document.getElementById('confirm-options-container');

    if (!modal) return Promise.resolve(null);

    // Configurar iconos y textos
    iconContainer.innerHTML = `<i data-lucide="clock" style="width: 48px; height: 48px; stroke-width: 1.5;"></i>`;
    iconContainer.style.color = "var(--color-primary)";
    titleEl.textContent = title;
    messageEl.textContent = message;
    messageEl.style.whiteSpace = 'pre-wrap';
    messageEl.style.textAlign = 'center';

    // Mostrar opciones como botones
    optionsContainer.innerHTML = slots.map((slot, index) => {
        return `<button class="btn-primary" style="background: var(--color-success); color: white; padding: 10px; width: 100%; border-radius: var(--radius-sm); border: none; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; margin-bottom: 5px;" data-slot-index="${index}">${slot.start} a ${slot.end}</button>`;
    }).join('');
    optionsContainer.style.display = 'flex';

    // Configurar botones de cancelar/aceptar
    btnCancel.style.display = 'inline-block';
    btnCancel.textContent = "Cancelar";
    btnAccept.style.display = 'none';

    modal.style.display = 'flex';
    lucide.createIcons();

    return new Promise((resolve) => {
        const buttons = optionsContainer.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-slot-index'));
                modal.style.display = 'none';
                optionsContainer.style.display = 'none';
                optionsContainer.innerHTML = '';
                resolve(slots[idx]);
            };
        });

        btnCancel.onclick = () => {
            modal.style.display = 'none';
            optionsContainer.style.display = 'none';
            optionsContainer.innerHTML = '';
            resolve(null);
        };
    });
};

// Validar campos requeridos de forma personalizada mostrando alerta premium
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    const requiredFields = form.querySelectorAll('[required]');
    for (let field of requiredFields) {
        if (!field.value || field.value.trim() === '') {
            let labelText = '';
            
            // Buscar etiqueta asociada por ID
            const label = form.querySelector(`label[for="${field.id}"]`);
            if (label) {
                labelText = label.textContent.trim();
            } else {
                // Buscar etiqueta padre
                const parentLabel = field.closest('label');
                if (parentLabel) {
                    labelText = parentLabel.textContent.trim();
                } else {
                    // Fallback a placeholder o nombre del elemento
                    labelText = field.placeholder || field.getAttribute('placeholder') || field.name || 'este campo';
                }
            }

            // Limpiar texto de la etiqueta (quitar asteriscos, opcionales, dos puntos al final)
            labelText = labelText.replace('(Opcional)', '').replace(/:$/, '').trim();

            // Mostrar el modal premium
            alert(`Por favor, complete el campo requerido: "${labelText}"`, "Campo Requerido");
            
            // Focalizar en el input vacío
            field.focus();
            return false;
        }
    }
    return true;
}

// ==========================================================
// INITIALIZATION
// ==========================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Aplicar tema guardado
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeUI();

    // Lucide Icons init
    lucide.createIcons();

    // Validar sesión del usuario al cargar la página
    const { data: { session } } = await supabaseClient.auth.getSession();
    handleAuthChange(session);

    // Escuchar cambios de autenticación
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        handleAuthChange(session);
    });

    // Escuchar clics globales para cerrar el menú contextual personalizado
    document.addEventListener('click', () => {
        const menu = document.getElementById('custom-context-menu');
        if (menu) menu.style.display = 'none';
    });

    // Escuchar cambios en el formulario de nueva consulta para actualizar la vista previa de WhatsApp
    const formNewConsultation = document.getElementById('form-new-consultation');
    if (formNewConsultation) {
        formNewConsultation.addEventListener('input', updateWhatsAppPreview);
    }

    // Auto-rellenar hora de fin con 1 hora de diferencia respecto a la de inicio
    const startTimeInput = document.getElementById('app-start-time');
    const endTimeInput = document.getElementById('app-end-time');
    if (startTimeInput && endTimeInput) {
        startTimeInput.addEventListener('change', () => {
            const startVal = startTimeInput.value;
            if (startVal) {
                const [h, m] = startVal.split(':').map(Number);
                const endH = (h + 1) % 24;
                const endTimeStr = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                endTimeInput.value = endTimeStr;
            }
        });
    }

    // Auto-refrescar dashboard cada 30 segundos para actualizar el estado de parpadeo de las citas cercanas
    setInterval(renderDashboard, 30000);

    // Monitorear citas entrantes en tiempo real para disparar el recordatorio de inicio
    setInterval(checkUpcomingAppointments, 15000);
});

function renderAllViews() {
    renderDashboard();
    renderPatients();
    renderCalendar();
    populatePatientSelect();
}

async function handleAuthChange(session) {
    const loginContainer = document.getElementById('login-container');
    const appWrapper = document.getElementById('app-wrapper');

    if (session) {
        state.user = session.user;
        
        // Esconder pantalla de login y mostrar app
        if (loginContainer) loginContainer.style.display = 'none';
        if (appWrapper) appWrapper.style.display = 'flex';

        // Actualizar datos del perfil de la doctora
        const doctorNameElements = document.querySelectorAll('.doctor-name');
        const doctorAvatarElements = document.querySelectorAll('.doctor-avatar');
        const displayName = state.user.user_metadata?.full_name || state.user.email;
        
        doctorNameElements.forEach(el => el.textContent = displayName);
        doctorAvatarElements.forEach(el => {
            el.textContent = displayName.substring(0, 2).toUpperCase();
            if (state.user.user_metadata?.avatar_url) {
                el.innerHTML = `<img src="${state.user.user_metadata.avatar_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            }
        });

        // Cargar datos del usuario autenticado
        await refreshStateFromSupabase();
        
        // Rellenar datos de prueba opcionalmente deshabilitado para evitar que clientes borrados reaparezcan
        renderAllViews();
    } else {
        state.user = null;
        if (loginContainer) loginContainer.style.display = 'flex';
        if (appWrapper) appWrapper.style.display = 'none';
    }
}

function toggleAuthView(view) {
    const loginView = document.getElementById('auth-login-view');
    const registerView = document.getElementById('auth-register-view');
    if (view === 'login') {
        if (loginView) loginView.style.display = 'flex';
        if (registerView) registerView.style.display = 'none';
    } else {
        if (loginView) loginView.style.display = 'none';
        if (registerView) registerView.style.display = 'flex';
    }
}

async function loginWithEmail(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const captchaToken = hcaptcha.getResponse();
    if (!captchaToken) {
        alert("Por favor, completa la verificación de seguridad (hCaptcha).", "Verificación Requerida");
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
            options: {
                captchaToken
            }
        });
        if (error) throw error;
    } catch (err) {
        console.error("Error al iniciar sesión con email:", err);
        alert("Credenciales incorrectas: " + (err.message || JSON.stringify(err)), "Error de Autenticación");
        hcaptcha.reset();
    }
}

async function registerWithEmail(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const captchaToken = hcaptcha.getResponse();
    if (!captchaToken) {
        alert("Por favor, completa la verificación de seguridad (hCaptcha).", "Verificación Requerida");
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
                captchaToken,
                data: {
                    full_name: name
                }
            }
        });
        if (error) throw error;
        
        alert("¡Registro enviado con éxito! Si tienes la confirmación por correo activa, revisa tu bandeja de entrada.", "Registro Exitoso");
        toggleAuthView('login');
        hcaptcha.reset();
    } catch (err) {
        console.error("Error al registrarse:", err);
        alert("Ocurrió un error al registrar la cuenta: " + (err.message || JSON.stringify(err)), "Error de Registro");
        hcaptcha.reset();
    }
}

async function loginWithGoogle() {
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    } catch (err) {
        console.error("Error al iniciar sesión con Google:", err);
        alert("Ocurrió un error al intentar autenticarte con Google.");
    }
}

async function logout() {
    const confirmLogout = await confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (!confirmLogout) return;
    
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    } catch (err) {
        console.error("Error al cerrar sesión:", err);
    }
}

// Fetch all database records from Supabase cloud
async function refreshStateFromSupabase() {
    try {
        const [patientsRes, appointmentsRes, settingsRes] = await Promise.all([
            supabaseClient.from('patients').select('*').eq('created_by', state.user?.id),
            supabaseClient.from('appointments').select('*').eq('created_by', state.user?.id),
            supabaseClient.from('clinic_settings').select('*').eq('user_id', state.user?.id).maybeSingle()
        ]);

        if (patientsRes.error) throw patientsRes.error;
        if (appointmentsRes.error) throw appointmentsRes.error;

        state.patients = patientsRes.data || [];
        state.appointments = appointmentsRes.data || [];
        lastPatientsCount = state.patients.length;
        
        if (settingsRes.data) {
            state.clinicSettings = settingsRes.data;
            // Rellenar formulario settings si está visible
            const inputDocName = document.getElementById('settings-doctor-name');
            const inputAddress = document.getElementById('settings-clinic-address');
            const inputPhone = document.getElementById('settings-owner-phone');
            const inputSocial = document.getElementById('settings-social-link');
            
            if (inputDocName) inputDocName.value = settingsRes.data.doctor_name;
            if (inputAddress) inputAddress.value = settingsRes.data.clinic_address;
            if (inputPhone) inputPhone.value = settingsRes.data.owner_phone;
            if (inputSocial) inputSocial.value = settingsRes.data.social_link || '';

            // Actualizar la firma de la doctora en pantalla
            const nameEl = document.querySelector('.doctor-name');
            if (nameEl && settingsRes.data.doctor_name) {
                nameEl.textContent = settingsRes.data.doctor_name;
            }
        }
    } catch (err) {
        console.error("Error al sincronizar con Supabase:", err);
    }
}

// ==========================================================
// MOCK DATA LOAD
// ==========================================================
async function loadMockData() {
    const mockPatients = [
        {
            id: "123456",
            name: "Armando Rondón",
            phone: "584121234567",
            birth_date: "1995-05-12",
            history: [
                {
                    date: "2026-05-10",
                    notes: "Presión ocular normal. Ligero cansancio visual nocturno.",
                    prescription: "Gotas lubricantes (Lágrimas artificiales) 1 gota cada 8 horas por 30 días.",
                    nextAppointment: "2026-06-22",
                    od: { esfera: "-0.50", cilindro: "+0.25", eje: "180", av: "20/20", pio: "14" },
                    os: { esfera: "-0.75", cilindro: "0.00", eje: "0", av: "20/25", pio: "15" }
                }
            ]
        },
        {
            id: "789012",
            name: "María Pérez",
            phone: "584149876543",
            birth_date: "1988-11-23",
            history: []
        }
    ];

    const mockAppointments = [
        {
            id: "app-1",
            patient_id: "123456",
            date: new Date().toISOString().split('T')[0], // hoy
            start_time: "09:00",
            end_time: "10:00",
            type: "consulta"
        },
        {
            id: "app-2",
            patient_id: "789012",
            date: new Date().toISOString().split('T')[0], // hoy
            start_time: "11:00",
            end_time: "12:30",
            type: "cirugia"
        }
    ];

    try {
        // Cargar pacientes de prueba
        await supabaseClient.from('patients').insert(mockPatients);
        // Cargar citas de prueba
        await supabaseClient.from('appointments').insert(mockAppointments);
        // Refrescar estado local
        await refreshStateFromSupabase();
        renderAllViews();
    } catch (err) {
        console.error("Error cargando mock data en Supabase:", err);
    }
}

// ==========================================================
// NAVIGATION & THEME
// ==========================================================
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.mobile-nav-item').forEach(item => item.classList.remove('active'));

    document.getElementById(`page-${pageId}`).classList.add('active');
    
    // Pestaña activa en sidebar
    const navItem = document.getElementById(`nav-${pageId}`);
    if (navItem) navItem.classList.add('active');
    
    // Pestaña activa en barra móvil
    const mobileNavItem = document.getElementById(`mobile-nav-${pageId}`);
    if (mobileNavItem) mobileNavItem.classList.add('active');

    if (pageId === 'dashboard') renderDashboard();
    if (pageId === 'patients') renderPatients();
    if (pageId === 'agenda') renderCalendar();
    if (pageId === 'settings') loadClinicSettingsForm();
    if (pageId === 'linkgen') initLinkgenPage();
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('appgene_theme', state.theme);
    updateThemeUI();
}

function updateThemeUI() {
    const text = document.getElementById('theme-text');
    const button = document.querySelector('.btn-theme');
    const mobileIcon = document.getElementById('theme-icon-mobile');
    
    if (state.theme === 'dark') {
        if (text) text.textContent = "Modo Claro";
        if (button) button.innerHTML = `<i data-lucide="sun"></i> <span id="theme-text">Modo Claro</span>`;
        if (mobileIcon) mobileIcon.setAttribute('data-lucide', 'sun');
    } else {
        if (text) text.textContent = "Modo Oscuro";
        if (button) button.innerHTML = `<i data-lucide="moon"></i> <span id="theme-text">Modo Oscuro</span>`;
        if (mobileIcon) mobileIcon.setAttribute('data-lucide', 'moon');
    }
    lucide.createIcons();
}

// ==========================================================
// MODALS
// ==========================================================
function openNewPatientModal() {
    document.getElementById('form-new-patient').reset();
    document.getElementById('modal-patient').style.display = 'flex';
}

function openNewAppointmentModal() {
    document.getElementById('form-new-appointment').reset();
    
    // Predeterminar fecha actual en formato local YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('app-date').value = `${yyyy}-${mm}-${dd}`;
    
    populatePatientSelect();
    document.getElementById('modal-appointment').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ==========================================================
// CLIENTS & CLINICAL RECORD MANAGEMENT
// ==========================================================
function populatePatientSelect() {
    const select = document.getElementById('app-patient-select');
    if (!select) return;
    select.innerHTML = state.patients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');
}

async function savePatient(e) {
    e.preventDefault();
    if (!validateForm('form-new-patient')) return;
    const id = document.getElementById('p-id').value;
    const name = document.getElementById('p-name').value;
    const phone = document.getElementById('p-phone').value;
    const birth_date = document.getElementById('p-birth').value;

    if (state.patients.some(p => p.id === id)) {
        alert("Ya existe un paciente registrado con ese documento de identidad.");
        return;
    }

    const newPatient = { id, name, phone, birth_date, history: [], created_by: state.user.id };

    try {
        const { error } = await supabaseClient.from('patients').insert([newPatient]);
        if (error) throw error;

        // Actualizar localmente y renderizar
        state.patients.push(newPatient);
        closeModal('modal-patient');
        renderPatients();
        renderDashboard();
        populatePatientSelect();
    } catch (err) {
        console.error("Error al registrar paciente:", err);
        alert("Error al registrar paciente en el servidor: " + (err.message || JSON.stringify(err)));
    }
}

function renderPatients() {
    const listTable = document.getElementById('patients-list-table');
    if (!listTable) return;

    listTable.innerHTML = state.patients.map(p => {
        const cleanPhone = p.phone.replace(/[^0-9]/g, '');
        let whatsappPhone = cleanPhone;
        if (cleanPhone.startsWith('0')) {
            whatsappPhone = '58' + cleanPhone.substring(1);
        }
        const waLink = `https://wa.me/${whatsappPhone}`;

        return `
            <tr style="border-bottom: 1px solid var(--border-color); hover:background-color: var(--bg-surface-hover);">
                <td style="padding: 16px; font-weight: 600;">${p.id}</td>
                <td style="padding: 16px;">${p.name}</td>
                <td style="padding: 16px;">
                    <a href="${waLink}" target="_blank" style="color: var(--color-primary); text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;" title="Abrir chat de WhatsApp">
                        <i data-lucide="message-circle" style="width: 16px; height: 16px; color: var(--color-success);"></i>
                        ${p.phone}
                    </a>
                </td>
                <td style="padding: 16px;">
                    <button class="btn-primary" style="padding: 8px 12px; font-size: 0.85rem; display: inline-flex; align-items: center; justify-content: center;" onclick="openClinicalHistory('${p.id}')" title="Ver Historia Clínica">
                        <i data-lucide="file-text"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    lucide.createIcons();
}

async function deletePatient(patientId) {
    const patient = state.patients.find(p => p.id === patientId);
    if (!patient) return false;

    const confirmDelete = await confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${patient.name}? También se borrarán sus citas programadas.`);
    if (!confirmDelete) return false;

    try {
        console.log(`[Database] Intentando eliminar paciente ID: ${patientId} de la base de datos...`);
        const { error } = await supabaseClient.from('patients').delete().eq('id', patientId);
        if (error) {
            console.error(`[Database Error] Supabase rechazó la eliminación:`, error);
            throw error;
        }

        console.log(`[Database Success] Paciente ID: ${patientId} eliminado exitosamente de Supabase.`);
        
        // Eliminar del estado local
        state.patients = state.patients.filter(p => p.id !== patientId);
        state.appointments = state.appointments.filter(app => app.patient_id !== patientId);

        renderPatients();
        renderDashboard();
        renderCalendar();
        populatePatientSelect();
        
        alert("El paciente y sus citas asociadas han sido eliminados de la base de datos.", "Paciente Eliminado");
        return true;
    } catch (err) {
        console.error("Error al borrar paciente:", err);
        alert(`Ocurrió un error al intentar eliminar el paciente en el servidor: ${err.message || JSON.stringify(err)}`, "Error al Eliminar");
        return false;
    }
}

async function triggerDeleteCurrentPatient() {
    if (!state.currentPatientId) return;
    const success = await deletePatient(state.currentPatientId);
    if (success) {
        closeModal('modal-clinical-history');
    }
}

// ==========================================================
// AGENDA INTELIGENTE & EVITAR SOLAPAMIENTOS
// ==========================================================
function checkCollision(date, startTime, endTime, skipAppId = null) {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    for (let app of state.appointments) {
        if (app.id === skipAppId) continue;
        if (app.date === date) {
            const appStart = new Date(`${app.date}T${app.start_time}`);
            const appEnd = new Date(`${app.date}T${app.end_time}`);

            // Validar solapamiento: (StartA < EndB) y (EndA > StartB)
            if (start < appEnd && end > appStart) {
                // Si cualquiera de las dos citas en conflicto es cirugia, es solapamiento critico
                if (app.type === 'cirugia' || document.getElementById('app-type').value === 'cirugia') {
                    return true;
                }
                // Si coinciden en la misma hora exacta para consulta, tambien choca
                if (app.start_time === startTime) {
                    return true;
                }
            }
        }
    }
    return false;
}

function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function minutesToTime(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function isValidSlot(date, type, startTime, endTime) {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    
    for (let app of state.appointments) {
        if (app.date === date) {
            const appStart = new Date(`${app.date}T${app.start_time}`);
            const appEnd = new Date(`${app.date}T${app.end_time}`);
            
            if (start < appEnd && end > appStart) {
                if (app.type === 'cirugia' || type === 'cirugia' || app.start_time === startTime) {
                    return false;
                }
            }
        }
    }
    return true;
}

function getAvailableWindows(date, type, duration) {
    const workStart = 8 * 60; // 08:00
    const workEnd = 18 * 60;  // 18:00
    
    const validStarts = [];
    for (let m = workStart; m <= workEnd - duration; m += 5) {
        const startStr = minutesToTime(m);
        const endStr = minutesToTime(m + duration);
        if (isValidSlot(date, type, startStr, endStr)) {
            validStarts.push(m);
        }
    }
    
    if (validStarts.length === 0) return [];
    
    const ranges = [];
    let startRange = validStarts[0];
    let prev = validStarts[0];
    
    for (let i = 1; i < validStarts.length; i++) {
        if (validStarts[i] === prev + 5) {
            prev = validStarts[i];
        } else {
            ranges.push({ start: startRange, end: prev + duration });
            startRange = validStarts[i];
            prev = validStarts[i];
        }
    }
    ranges.push({ start: startRange, end: prev + duration });
    
    return ranges.map(r => `${minutesToTime(r.start)} a ${minutesToTime(r.end)}`);
}

function getFirstThreeSlots(date, type, duration) {
    const workStart = 8 * 60; // 08:00
    const workEnd = 18 * 60;  // 18:00
    const slots = [];
    for (let m = workStart; m <= workEnd - duration; m += 15) {
        const startStr = minutesToTime(m);
        const endStr = minutesToTime(m + duration);
        if (isValidSlot(date, type, startStr, endStr)) {
            slots.push({ start: startStr, end: endStr });
            if (slots.length === 3) break;
        }
    }
    return slots;
}

async function saveAppointment(e) {
    e.preventDefault();
    if (!validateForm('form-new-appointment')) return;
    const patientId = document.getElementById('app-patient-select').value;
    const date = document.getElementById('app-date').value;
    const type = document.getElementById('app-type').value;
    const startTime = document.getElementById('app-start-time').value;
    const endTime = document.getElementById('app-end-time').value;

    const collisions = [];
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    for (let app of state.appointments) {
        if (app.date === date) {
            const appStart = new Date(`${app.date}T${app.start_time}`);
            const appEnd = new Date(`${app.date}T${app.end_time}`);

            if (start < appEnd && end > appStart) {
                if (app.type === 'cirugia' || type === 'cirugia' || app.start_time === startTime) {
                    collisions.push(app);
                }
            }
        }
    }

    if (collisions.length > 0) {
        const collisionDetails = collisions.map(app => {
            const patient = state.patients.find(p => p.id === app.patient_id);
            const patientName = patient ? patient.name : 'Paciente';
            const baseType = app.type.replace('_completed', '');
            const typeLabel = baseType === 'cirugia' ? 'Cirugía' : baseType === 'consulta' ? 'Consulta' : 'Control';
            const startTimeFormatted = app.start_time ? app.start_time.substring(0, 5) : '';
            const endTimeFormatted = app.end_time ? app.end_time.substring(0, 5) : '';
            return `• ${typeLabel} de ${patientName} (${startTimeFormatted} - ${endTimeFormatted})`;
        }).join('\n');

        // Calcular duración
        const startMins = timeToMinutes(startTime);
        const endMins = timeToMinutes(endTime);
        const duration = endMins - startMins;

        // Obtener ventanas de tiempo disponibles
        const availableWindows = getAvailableWindows(date, type, duration);
        let chanceMsg = "";
        if (availableWindows.length > 0) {
            chanceMsg = `\n\nHorarios disponibles para esta duración hoy:\n${availableWindows.map(w => `• ${w}`).join('\n')}`;
        } else {
            chanceMsg = `\n\nNo hay horarios disponibles para esta duración hoy.`;
        }

        const firstThreeSlots = getFirstThreeSlots(date, type, duration);
        const extraBtns = [];
        if (firstThreeSlots.length > 0) {
            extraBtns.push({ text: "Seleccionar hora disponible", value: "show_slots" });
        }

        const choice = await alertWithOptions(
            `El horario seleccionado se solapa con:\n${collisionDetails}${chanceMsg}`, 
            "Conflicto de Horario",
            extraBtns
        );

        if (choice === 'show_slots') {
            const selectedSlot = await promptSlots(
                "Puedes seleccionar una de estas horas:",
                firstThreeSlots,
                "Horas Disponibles"
            );
            if (selectedSlot) {
                document.getElementById('app-start-time').value = selectedSlot.start;
                document.getElementById('app-end-time').value = selectedSlot.end;

                // Verificar si el paciente ya tiene otra cita ese mismo día
                const existingApp = state.appointments.find(app => app.patient_id === patientId && app.date === date);
                if (existingApp) {
                    const confirmDuplicate = await confirm(`Este cliente tuvo una cita hoy a las ${existingApp.start_time.substring(0, 5)}. ¿Seguro deseas crear otra cita para hoy?`, "Cita Duplicada");
                    if (!confirmDuplicate) return;
                }

                const newApp = {
                    id: 'app-' + Date.now(),
                    patient_id: patientId,
                    date,
                    type,
                    start_time: selectedSlot.start,
                    end_time: selectedSlot.end,
                    created_by: state.user.id
                };

                try {
                    const { error } = await supabaseClient.from('appointments').insert([newApp]);
                    if (error) throw error;

                    state.appointments.push(newApp);
                    closeModal('modal-appointment');
                    renderCalendar();
                    renderDashboard();
                } catch (err) {
                    console.error("Error al registrar cita automática:", err);
                    alert("Ocurrió un error al registrar el horario en el servidor.");
                }
            }
        }
        return;
    }

    // Verificar si el paciente ya tiene otra cita ese mismo día
    const existingApp = state.appointments.find(app => app.patient_id === patientId && app.date === date);
    if (existingApp) {
        const confirmDuplicate = await confirm(`Este cliente tuvo una cita hoy a las ${existingApp.start_time.substring(0, 5)}. ¿Seguro deseas crear otra cita para hoy?`, "Cita Duplicada");
        if (!confirmDuplicate) return;
    }

    const newApp = {
        id: 'app-' + Date.now(),
        patient_id: patientId,
        date,
        type,
        start_time: startTime,
        end_time: endTime,
        created_by: state.user.id
    };

    try {
        const { error } = await supabaseClient.from('appointments').insert([newApp]);
        if (error) throw error;

        state.appointments.push(newApp);
        closeModal('modal-appointment');
        renderCalendar();
        renderDashboard();
    } catch (err) {
        console.error("Error al agendar cita:", err);
        alert("Ocurrió un error al registrar el horario en el servidor.");
    }
}

// ==========================================================
// HISTORIA CLINICA Y WHATSAPP GENERATOR
// ==========================================================
function openClinicalHistory(patientId) {
    state.currentPatientId = patientId;
    const patient = state.patients.find(p => p.id === patientId);
    if (!patient) return;

    document.getElementById('ch-patient-title').textContent = `Historia Clínica - ${patient.name}`;
    
    // Rellenar información demográfica del paciente
    const pIdEl = document.getElementById('ch-p-id');
    const pPhoneEl = document.getElementById('ch-p-phone');
    const pBirthEl = document.getElementById('ch-p-birth');
    
    if (pIdEl) pIdEl.textContent = patient.id;
    if (pPhoneEl) pPhoneEl.textContent = patient.phone || 'No registrado';
    if (pBirthEl) pBirthEl.textContent = patient.birth_date || 'No registrada';

    // Rellenar próxima cita o cirugía programada
    const nextAppEl = document.getElementById('ch-p-next-app');
    if (nextAppEl) {
        const todayStr = new Date().toISOString().split('T')[0];
        const patientApps = state.appointments.filter(app => app.patient_id === patientId && app.type !== 'cancelada');
        patientApps.sort((a,b) => `${a.date}T${a.start_time}`.localeCompare(`${b.date}T${b.end_time}`));
        const futureApp = patientApps.find(app => {
            const appDateTime = new Date(`${app.date}T${app.start_time}`);
            return appDateTime >= new Date() || app.date === todayStr;
        });

        if (futureApp) {
            const typeLabel = futureApp.type === 'cirugia' ? 'Cirugía' : 'Consulta';
            const startTimeFormatted = futureApp.start_time ? futureApp.start_time.substring(0, 5) : '';
            nextAppEl.textContent = `${futureApp.date} a las ${startTimeFormatted} (${typeLabel})`;
            nextAppEl.style.color = 'var(--color-primary)';
            nextAppEl.style.fontWeight = '600';
        } else {
            nextAppEl.textContent = 'Ninguna programada';
            nextAppEl.style.color = 'var(--text-muted)';
            nextAppEl.style.fontWeight = 'normal';
        }
    }

    document.getElementById('form-new-consultation').reset();
    
    renderTimeline(patient);
    updateWhatsAppPreview();
    
    document.getElementById('modal-clinical-history').style.display = 'flex';
    lucide.createIcons();
}

function openNewConsultationFromCurrent() {
    closeModal('modal-clinical-history');
    document.getElementById('form-new-consultation').reset();
    state.currentAppointmentId = null; // No viene de una cita específica
    const container = document.getElementById('next-appointment-container');
    if (container) container.style.display = 'none';
    
    const patient = state.patients.find(p => p.id === state.currentPatientId);
    if (patient) {
        document.getElementById('new-consultation-title').textContent = `Registrar Consulta de Hoy - ${patient.name}`;
    }
    
    // Resetear al ojo derecho por defecto al abrir
    switchEyePanel('od');
    
    document.getElementById('modal-new-consultation').style.display = 'flex';
    lucide.createIcons();
}

function switchEyePanel(eye) {
    const odPanel = document.getElementById('panel-eye-od');
    const osPanel = document.getElementById('panel-eye-os');
    const odBtn = document.getElementById('btn-toggle-od');
    const osBtn = document.getElementById('btn-toggle-os');

    if (!odPanel || !osPanel || !odBtn || !osBtn) return;

    if (eye === 'od') {
        odPanel.style.display = 'block';
        osPanel.style.display = 'none';
        odBtn.classList.add('active');
        osBtn.classList.remove('active');
    } else {
        odPanel.style.display = 'none';
        osPanel.style.display = 'block';
        odBtn.classList.remove('active');
        osBtn.classList.add('active');
    }
}

function renderTimeline(patient) {
    const timeline = document.getElementById('clinical-records-timeline');
    if (!timeline) return;

    if (!patient.history || patient.history.length === 0) {
        timeline.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 2rem;">No hay consultas previas registradas para este paciente.</div>`;
        return;
    }

    timeline.innerHTML = patient.history.map((record, index) => {
        const recordId = `record-body-${index}`;
        return `
            <div class="card" style="padding: 0; overflow: hidden; border-left: 4px solid var(--color-primary); margin-bottom: 8px;">
                <!-- Cabecera del acordeon (Click para contraer/expandir) -->
                <div onclick="toggleAccordion('${recordId}')" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background-color: var(--bg-surface-hover); cursor: pointer; user-select: none;">
                    <div style="font-weight: 700; font-size: 0.95rem;">
                        📅 Consulta del: ${record.date}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="badge-event badge-consulta" style="display: inline-block; padding: 2px 6px;">Consulta</span>
                        <i data-lucide="chevron-down" id="icon-${recordId}" style="width: 18px; height: 18px; transition: var(--transition-smooth);"></i>
                    </div>
                </div>
                
                <!-- Contenido colapsable (Oculto por defecto) -->
                <div id="${recordId}" style="display: none; padding: 16px; border-top: 1px solid var(--border-color); animation: fadeIn 0.3s ease;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 15px; margin-bottom: 12px; font-size: 0.9rem;">
                        <div class="eye-panel" style="margin-top: 0; padding: 10px;">
                            <div style="font-weight:600; color: var(--color-primary); margin-bottom: 4px;">Ojo Derecho (OD)</div>
                            <div>AV: ${record.od.av || 'N/A'} | PIO: ${record.od.pio || 'N/A'} mmHg</div>
                            <div>Ref: ${record.od.esfera || '0'} / ${record.od.cilindro || '0'} x ${record.od.eje || '0'}°</div>
                        </div>
                        <div class="eye-panel" style="margin-top: 0; padding: 10px;">
                            <div style="font-weight:600; color: var(--color-primary); margin-bottom: 4px;">Ojo Izquierdo (OS)</div>
                            <div>AV: ${record.os.av || 'N/A'} | PIO: ${record.os.pio || 'N/A'} mmHg</div>
                            <div>Ref: ${record.os.esfera || '0'} / ${record.os.cilindro || '0'} x ${record.os.eje || '0'}°</div>
                        </div>
                    </div>
                    <div style="font-size: 0.9rem; margin-bottom: 8px;">
                        <strong>Observaciones:</strong> ${record.notes || 'Sin observaciones.'}
                    </div>
                    <div style="font-size: 0.9rem; padding: 8px; border-radius: var(--radius-sm); background-color: var(--bg-app); border: 1px solid var(--border-color);">
                        <strong>Tratamiento / Recipe:</strong> ${record.prescription}
                    </div>
                    ${record.nextAppointment ? `<div style="font-size: 0.85rem; margin-top: 8px; color: var(--color-accent); font-weight:600;">Próxima cita programada: ${record.nextAppointment}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

function toggleAccordion(elementId) {
    const el = document.getElementById(elementId);
    const icon = document.getElementById(`icon-${elementId}`);
    if (!el) return;

    if (el.style.display === 'none') {
        el.style.display = 'block';
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        el.style.display = 'none';
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
}

function handleNextAppointmentToggle() {
    const isChecked = document.getElementById('toggle-next-appointment').checked;
    const container = document.getElementById('next-appointment-container');
    const input = document.getElementById('c-next-appointment');
    if (isChecked) {
        container.style.display = 'block';
        input.setAttribute('required', 'true');
    } else {
        container.style.display = 'none';
        input.removeAttribute('required');
        input.value = '';
    }
}

function updateWhatsAppPreview() {
    // Ya no es necesario actualizar un contenedor visible de previsualización en el DOM
}

function generateAndSendWhatsApp() {
    if (!validateForm('form-new-consultation')) return;
    const patient = state.patients.find(p => p.id === state.currentPatientId);
    if (!patient) return;

    const prescription = document.getElementById('c-prescription').value || "Sin indicaciones adicionales.";
    const notes = document.getElementById('c-notes').value || "Evaluación de rutina sin hallazgos inusuales.";
    const hasNextAppointment = document.getElementById('toggle-next-appointment').checked;
    const nextDate = hasNextAppointment ? document.getElementById('c-next-appointment').value : null;

    const docName = state.clinicSettings.doctor_name || 'Dra. Especialista';
    const address = state.clinicSettings.clinic_address || 'Consultorio Clínico';

    let message = `Saludos, ${patient.name}\n\nEn la consulta de hoy se determinaron las siguientes observaciones:\n${notes}\n\nTratamiento e indicaciones a seguir:\n${prescription}`;

    if (nextDate) {
        message += `\n\nPróxima cita programada: ${nextDate}`;
    }

    message += `\n\nAtentamente,\n${docName}\nUbicación: ${address}`;

    const cleanPhone = patient.phone.replace(/[^0-9]/g, ''); // solo dígitos
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

async function saveConsultation(e) {
    e.preventDefault();
    if (!validateForm('form-new-consultation')) return;
    const patientIndex = state.patients.findIndex(p => p.id === state.currentPatientId);
    if (patientIndex === -1) return;

    const hasNextAppointment = document.getElementById('toggle-next-appointment').checked;
    const nextAppointmentValue = hasNextAppointment ? (document.getElementById('c-next-appointment').value || null) : null;

    const newRecord = {
        date: new Date().toISOString().split('T')[0],
        notes: document.getElementById('c-notes').value,
        prescription: document.getElementById('c-prescription').value,
        nextAppointment: nextAppointmentValue,
        od: {
            esfera: document.getElementById('od-esfera').value,
            cilindro: document.getElementById('od-cilindro').value,
            eje: document.getElementById('od-eje').value,
            av: document.getElementById('od-av').value,
            pio: document.getElementById('od-pio').value
        },
        os: {
            esfera: document.getElementById('os-esfera').value,
            cilindro: document.getElementById('os-cilindro').value,
            eje: document.getElementById('os-eje').value,
            av: document.getElementById('os-av').value,
            pio: document.getElementById('os-pio').value
        }
    };

    // Agregar registro al historial
    const updatedHistory = [...(state.patients[patientIndex].history || [])];
    updatedHistory.unshift(newRecord);

    try {
        // Guardar el historial actualizado en Supabase
        const { error: patientErr } = await supabaseClient
            .from('patients')
            .update({ history: updatedHistory })
            .eq('id', state.currentPatientId);

        if (patientErr) throw patientErr;

        state.patients[patientIndex].history = updatedHistory;

        // Determinar qué cita marcar como completada
        let appointmentToCompleteId = state.currentAppointmentId;
        if (!appointmentToCompleteId) {
            const todayStr = new Date().toISOString().split('T')[0];
            const matchingApp = state.appointments.find(app => 
                app.patient_id === state.currentPatientId && 
                app.date === todayStr && 
                (app.type === 'consulta' || app.type === 'control')
            );
            if (matchingApp) {
                appointmentToCompleteId = matchingApp.id;
            }
        }

        if (appointmentToCompleteId) {
            const appIndex = state.appointments.findIndex(app => app.id === appointmentToCompleteId);
            if (appIndex !== -1) {
                const app = state.appointments[appIndex];
                if (!app.type.endsWith('_completed')) {
                    const newType = app.type + '_completed';
                    const { error: appUpdateErr } = await supabaseClient
                        .from('appointments')
                        .update({ type: newType })
                        .eq('id', appointmentToCompleteId);
                    
                    if (!appUpdateErr) {
                        state.appointments[appIndex].type = newType;
                    }
                }
            }
        }

        // Si hay próxima cita programada, guardarla en la tabla appointments
        if (newRecord.nextAppointment) {
            const newApp = {
                id: 'app-' + Date.now(),
                patient_id: state.currentPatientId,
                date: newRecord.nextAppointment,
                type: 'control',
                start_time: "09:00",
                end_time: "09:30",
                created_by: state.user.id
            };

            const { error: appErr } = await supabaseClient.from('appointments').insert([newApp]);
            if (appErr) throw appErr;

            state.appointments.push(newApp);
        }

        closeModal('modal-new-consultation');
        renderPatients();
        renderDashboard();
        renderCalendar();
    } catch (err) {
        console.error("Error al guardar consulta clínica:", err);
        alert("Ocurrió un error al guardar la consulta en el servidor remoto.");
    }
}

// ==========================================================
// RENDER CALENDARIO
// ==========================================================
function renderCalendar() {
    const grid = document.getElementById('calendar-days-grid');
    const headerTitle = document.getElementById('calendar-month-year');
    if (!grid) return;

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    headerTitle.textContent = `${monthNames[month]} ${year}`;

    // Cabeceras del calendario
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    let gridHTML = dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Espacios vacios
    for (let i = 0; i < firstDay; i++) {
        gridHTML += `<div style="background:transparent; cursor:default;"></div>`;
    }

    // Dias del mes
    const todayStr = new Date().toISOString().split('T')[0];
    for (let day = 1; day <= totalDays; day++) {
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dayStr === todayStr;

        // Buscar eventos de este dia
        const dayEvents = state.appointments.filter(app => app.date === dayStr);
        let eventsHTML = '';
        if (dayEvents.length > 0) {
            eventsHTML = `<div class="calendar-events">` + 
                dayEvents.map(app => {
                    const patient = state.patients.find(p => p.id === app.patient_id);
                    const name = patient ? patient.name.split(' ')[0] : 'Pac.';
                    const typeClass = app.type ? app.type.trim().toLowerCase() : '';
                    const typeUpper = app.type ? app.type.toUpperCase() : '';
                    const startTimeFormatted = app.start_time ? app.start_time.substring(0, 5) : '';
                    return `<span class="badge-event badge-${typeClass}" title="${startTimeFormatted} - ${typeUpper}: ${name}" oncontextmenu="event.stopPropagation(); showContextMenu(event, '${app.id}', '${app.type}', '${app.patient_id}')">${startTimeFormatted} ${name}</span>`;
                }).join('') + `</div>`;
        }

        gridHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''}" onclick="selectDate('${dayStr}')">
                <span class="calendar-day-number">${day}</span>
                ${eventsHTML}
            </div>
        `;
    }

    grid.innerHTML = gridHTML;
}

function prevMonth() {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
}

function selectDate(dateStr) {
    openNewAppointmentModal();
    document.getElementById('app-date').value = dateStr;
}

// ==========================================================
// RENDER DASHBOARD
// ==========================================================
function renderDashboard() {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Stats
    document.getElementById('stat-patients-count').textContent = state.patients.length;
    
    const todayApps = state.appointments.filter(app => app.date === todayStr);
    document.getElementById('stat-today-appointments').textContent = todayApps.length;
    
    const upcomingSurgeries = state.appointments.filter(app => app.date >= todayStr && app.type === 'cirugia');
    document.getElementById('stat-upcoming-surgeries').textContent = upcomingSurgeries.length;

    const trashBtn = document.getElementById('btn-dashboard-trash');
    if (trashBtn) {
        if (todayApps.length === 0 || state.dashboardDeleteMode) {
            trashBtn.style.display = 'none';
        } else {
            trashBtn.style.display = 'inline-flex';
        }
    }

    // Tabla del dia
    const todayEventsList = document.getElementById('today-events-list');
    const todayEventsHeader = document.getElementById('today-events-header');
    if (!todayEventsList || !todayEventsHeader) return;

    // Renderizar cabecera según el modo de eliminación
    if (state.dashboardDeleteMode) {
        todayEventsHeader.innerHTML = `
            <tr style="background-color: var(--bg-app); border-bottom: 1px solid var(--border-color);">
                <th style="padding: 16px; width: 40px; text-align: center;"></th>
                <th style="padding: 16px;">Hora</th>
                <th style="padding: 16px;">Paciente</th>
                <th style="padding: 16px;">Tipo</th>
                <th style="padding: 16px;">Acción</th>
            </tr>
        `;
    } else {
        todayEventsHeader.innerHTML = `
            <tr style="background-color: var(--bg-app); border-bottom: 1px solid var(--border-color);">
                <th style="padding: 16px;">Hora</th>
                <th style="padding: 16px;">Paciente</th>
                <th style="padding: 16px;">Tipo</th>
                <th style="padding: 16px;">Acción</th>
            </tr>
        `;
    }

    if (todayApps.length === 0) {
        const colspan = state.dashboardDeleteMode ? 5 : 4;
        todayEventsList.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center; padding: 2rem; color: var(--text-muted);">No tienes citas o cirugías programadas para hoy.</td></tr>`;
        return;
    }

    // Ordenar por hora
    todayApps.sort((a,b) => a.start_time.localeCompare(b.start_time));

    todayEventsList.innerHTML = todayApps.map(app => {
        const patient = state.patients.find(p => p.id === app.patient_id);
        const patientName = patient ? patient.name : 'Desconocido';
        
        // Formatear el badge del tipo de cita y si fue realizada/cancelada
        const isCancelled = app.type && app.type.trim().toLowerCase() === 'cancelada';
        const isCompleted = app.type && app.type.endsWith('_completed');
        const baseType = app.type ? app.type.replace('_completed', '') : '';
        
        let typeLabel = baseType === 'cirugia' ? 'Cirugía' : baseType === 'consulta' ? 'Consulta' : 'Control';
        let typeBadge = '';
        if (isCancelled) {
            typeBadge = `<span class="badge-event" style="display:inline-block; padding: 4px 8px; background-color: #ef4444; color: white;">Cancelada</span>`;
        } else {
            typeBadge = `<span class="badge-event badge-${baseType}${isCompleted ? '_completed' : ''}" style="display:inline-block; padding: 4px 8px;">${typeLabel}${isCompleted ? ' (Realizada)' : ''}</span>`;
        }
        
        let actionButton = 'N/A';
        if (isCancelled) {
            actionButton = `<button class="btn-primary" disabled style="padding: 6px 12px; font-size: 0.85rem; background: #e2e8f0 !important; background-image: none !important; color: #94a3b8 !important; border: 1px solid #cbd5e1 !important; cursor: not-allowed !important; pointer-events: none !important; box-shadow: none !important; transform: none !important;">Iniciar Consulta</button>`;
        } else if (baseType !== 'cirugia') {
            if (isCompleted) {
                actionButton = `<button class="btn-primary" style="padding: 6px 12px; font-size: 0.85rem; background: #64748b; box-shadow: 0 4px 10px rgba(100, 116, 139, 0.2);" onclick="openClinicalHistory('${app.patient_id}')">Chequear Consulta</button>`;
            } else {
                actionButton = `
                    <div style="display: inline-flex; gap: 8px; align-items: center;">
                        <button class="btn-primary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="openNewConsultationDirectly('${app.patient_id}', '${app.id}')">Iniciar Consulta</button>
                        <button class="btn-primary" style="padding: 6px 8px; font-size: 0.85rem; background: var(--color-success); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);" onclick="sendAppointmentReminder('${app.id}')" title="Enviar recordatorio por WhatsApp">
                            <i data-lucide="bell" style="width: 14px; height: 14px;"></i>
                        </button>
                    </div>
                `;
            }
        } else {
            // Si es cirugía activa, agregar opción de recordar también
            if (!isCompleted) {
                actionButton = `
                    <button class="btn-primary" style="padding: 6px 8px; font-size: 0.85rem; background: var(--color-success); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);" onclick="sendAppointmentReminder('${app.id}')" title="Enviar recordatorio por WhatsApp">
                        <i data-lucide="bell" style="width: 14px; height: 14px;"></i> Recordar
                    </button>
                `;
            }
        }

        // Parpadeo de color azul claro en la antesala de la cita (desde 20 minutos antes hasta el momento de inicio)
        let rowClass = "";
        if (!isCompleted && !isCancelled && baseType !== 'cirugia') {
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const startMinutes = timeToMinutes(app.start_time);
            const diff = startMinutes - nowMinutes;
            // Solo parpadear si faltan 20 minutos o menos, pero todavía no ha llegado la hora de inicio (diff > 0)
            if (diff <= 20 && diff > 0) {
                rowClass = "class='blink-blue'";
            }
        }

        const checkboxCell = state.dashboardDeleteMode ? `
            <td style="padding: 16px; text-align: center;">
                <input type="checkbox" class="delete-app-checkbox" value="${app.id}" id="chk-${app.id}" style="width: 18px; height: 18px; cursor: pointer;" onclick="event.stopPropagation(); updateSelectAllState();">
            </td>
        ` : '';

        const rowClickAction = state.dashboardDeleteMode ? `onclick="toggleRowCheckbox(event, 'chk-${app.id}')" style="cursor: pointer;"` : 'style="cursor: context-menu;"';

        const rowOpacity = isCancelled ? 'opacity: 0.5;' : '';

        const startTimeFormatted = app.start_time ? app.start_time.substring(0, 5) : '';
        const endTimeFormatted = app.end_time ? app.end_time.substring(0, 5) : '';

        return `
            <tr ${rowClass} ${rowClickAction} oncontextmenu="showContextMenu(event, '${app.id}', '${app.type}', '${app.patient_id}')" style="border-bottom: 1px solid var(--border-color); ${rowOpacity}">
                ${checkboxCell}
                <td style="padding: 16px; font-weight:600;">${startTimeFormatted} - ${endTimeFormatted}</td>
                <td style="padding: 16px;">${patientName}</td>
                <td style="padding: 16px;">${typeBadge}</td>
                <td style="padding: 16px;">
                    ${actionButton}
                </td>
            </tr>
        `;
    }).join('');
    lucide.createIcons();
}

function sendAppointmentReminder(appId) {
    const app = state.appointments.find(a => a.id === appId);
    if (!app) return;
    const patient = state.patients.find(p => p.id === app.patient_id);
    if (!patient) return;

    const baseType = app.type.replace('_completed', '');
    const typeLabel = baseType === 'cirugia' ? 'cirugía' : 'cita de control';

    const docName = state.clinicSettings.doctor_name || 'Dra. Especialista';
    const address = state.clinicSettings.clinic_address || 'el consultorio';

    const message = `Hola, ${patient.name}.\n\nTe recordamos tu ${typeLabel} programada para hoy a las ${app.start_time} en ${address}.\n\nPor favor, confírmanos tu asistencia. ¡Te esperamos!\n\nAtentamente,\n${docName}`;
    const cleanPhone = patient.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function openNewConsultationDirectly(patientId, appId) {
    state.currentPatientId = patientId;
    state.currentAppointmentId = appId || null;
    const patient = state.patients.find(p => p.id === patientId);
    document.getElementById('form-new-consultation').reset();
    const container = document.getElementById('next-appointment-container');
    if (container) container.style.display = 'none';
    
    if (patient) {
        document.getElementById('new-consultation-title').textContent = `Registrar Consulta de Hoy - ${patient.name}`;
    }
    
    // Resetear al ojo derecho por defecto al abrir
    switchEyePanel('od');
    
    document.getElementById('modal-new-consultation').style.display = 'flex';
    lucide.createIcons();
}

function showContextMenu(e, appId, appType, patientId) {
    e.preventDefault();
    const menu = document.getElementById('custom-context-menu');
    if (!menu) return;

    let menuHTML = '';
    // Si no es cirugía (o sea, es cita/control), mostramos la opción de Ver
    if (appType !== 'cirugia' && appType !== 'cancelada') {
        menuHTML += `
            <div class="context-menu-item" onclick="openClinicalHistory('${patientId}')">
                <i data-lucide="eye" style="width:16px; height:16px;"></i> Ver Historial
            </div>
        `;
    }
    
    // Opción de Cancelar Cita (solo si no es cirugía y no está ya cancelada)
    if (appType !== 'cirugia' && appType !== 'cancelada') {
        menuHTML += `
            <div class="context-menu-item" onclick="cancelAppointmentById('${appId}')" style="color: var(--color-warning);">
                <i data-lucide="x-circle" style="width:16px; height:16px; color: var(--color-warning);"></i> Cancelar Cita
            </div>
        `;
    }
    
    // Opción común de Eliminar
    menuHTML += `
        <div class="context-menu-item delete" onclick="deleteAppointment('${appId}')">
            <i data-lucide="trash-2" style="width:16px; height:16px;"></i> Eliminar
        </div>
    `;

    menu.innerHTML = menuHTML;
    menu.style.display = 'block';
    
    // Posicionar el menú donde se hizo clic
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    
    lucide.createIcons();
}

async function cancelAppointmentById(appId) {
    const confirmCancel = await confirm("¿Estás seguro de que deseas marcar esta cita como cancelada?");
    if (!confirmCancel) return;

    // Actualizar localmente de inmediato para asegurar respuesta instantánea
    const appIndex = state.appointments.findIndex(a => a.id === appId);
    if (appIndex !== -1) {
        state.appointments[appIndex].type = 'cancelada';
    }
    renderDashboard();
    renderCalendar();

    try {
        const { error } = await supabaseClient
            .from('appointments')
            .update({ type: 'cancelada' })
            .eq('id', appId);
        
        if (error) {
            console.error("Error al actualizar tipo en Supabase, intentando eliminar en su lugar...");
            // Si la base de datos rechaza la palabra 'cancelada', la eliminamos directamente como respaldo seguro
            await supabaseClient.from('appointments').delete().eq('id', appId);
            state.appointments = state.appointments.filter(a => a.id !== appId);
            renderDashboard();
            renderCalendar();
        }
    } catch (err) {
        console.error("Error de conexión al cancelar cita:", err);
    }
}

async function deleteAppointment(appId) {
    const confirmDelete = await confirm("¿Estás seguro de que deseas eliminar este evento/cirugía de la agenda?");
    if (!confirmDelete) return;

    // Actualizar estado local inmediatamente
    state.appointments = state.appointments.filter(app => app.id !== appId);
    renderDashboard();
    renderCalendar();

    try {
        const { error } = await supabaseClient.from('appointments').delete().eq('id', appId);
        if (error) throw error;
    } catch (err) {
        console.error("Error al eliminar cita/cirugía:", err);
        alert("Ocurrió un error al intentar eliminar el evento en el servidor.");
    }
}

// Búsqueda global
// Búsqueda global
function handleGlobalSearch() {
    const query = document.getElementById('global-search').value.toLowerCase().trim();
    
    // Si el usuario escribe y no está en la pestaña de Pacientes, lo redirigimos automáticamente
    const activePage = document.querySelector('.page.active');
    const activePageId = activePage ? activePage.id.replace('page-', '') : '';
    if (query !== '' && activePageId !== 'patients') {
        switchPage('patients');
    }

    if (query === '') {
        renderPatients();
        return;
    }

    const filtered = state.patients.filter(p => p.name.toLowerCase().includes(query) || p.id.includes(query));
    const listTable = document.getElementById('patients-list-table');
    if (!listTable) return;

    listTable.innerHTML = filtered.map(p => `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 16px; font-weight: 600;">${p.id}</td>
            <td style="padding: 16px;">${p.name}</td>
            <td style="padding: 16px;">${p.phone}</td>
            <td style="padding: 16px;">
                <button class="btn-primary" style="padding: 8px 12px; font-size: 0.85rem; display: inline-flex; align-items: center; justify-content: center;" onclick="openClinicalHistory('${p.id}')" title="Ver Historia Clínica">
                    <i data-lucide="file-text"></i>
                </button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

function enterDashboardDeleteMode() {
    state.dashboardDeleteMode = true;
    document.getElementById('btn-dashboard-trash').style.display = 'none';
    const selectAllContainer = document.getElementById('switch-select-all-container');
    const selectAllCheckbox = document.getElementById('chk-select-all');
    if (selectAllContainer) selectAllContainer.style.display = 'inline-flex';
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    document.getElementById('btn-dashboard-delete-confirm').style.display = 'inline-block';
    document.getElementById('btn-dashboard-delete-cancel').style.display = 'inline-block';
    renderDashboard();
}

// Búsqueda global
function exitDashboardDeleteMode() {
    state.dashboardDeleteMode = false;
    const selectAllContainer = document.getElementById('switch-select-all-container');
    const selectAllCheckbox = document.getElementById('chk-select-all');
    if (selectAllContainer) selectAllContainer.style.display = 'none';
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    document.getElementById('btn-dashboard-delete-confirm').style.display = 'none';
    document.getElementById('btn-dashboard-delete-cancel').style.display = 'none';
    renderDashboard();
}

function toggleSelectAllDashboard(checkbox) {
    const checkboxes = document.querySelectorAll('.delete-app-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
}

function updateSelectAllState() {
    const allCheckboxes = document.querySelectorAll('.delete-app-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.delete-app-checkbox:checked');
    const selectAllCheckbox = document.getElementById('chk-select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length;
    }
}

async function confirmDashboardDelete() {
    const checkboxes = document.querySelectorAll('.delete-app-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Por favor, seleccione al menos una cita para eliminar.");
        return;
    }

    const confirmDelete = await confirm(`¿Estás seguro de que deseas eliminar las ${checkboxes.length} citas seleccionadas?`);
    if (!confirmDelete) return;

    const idsToDelete = Array.from(checkboxes).map(cb => cb.value);

    try {
        const { error } = await supabaseClient.from('appointments').delete().in('id', idsToDelete);
        if (error) throw error;

        state.appointments = state.appointments.filter(app => !idsToDelete.includes(app.id));

        exitDashboardDeleteMode();
        renderCalendar();
    } catch (err) {
        console.error("Error al eliminar citas seleccionadas:", err);
        alert("Ocurrió un error al intentar eliminar las citas.");
    }
}

function toggleRowCheckbox(event, checkboxId) {
    if (event.target.closest('button') || event.target.closest('a') || event.target.closest('input[type="checkbox"]')) {
        return;
    }
    const cb = document.getElementById(checkboxId);
    if (cb) {
        cb.checked = !cb.checked;
        updateSelectAllState();
    }
}

window.promptReasons = function(title, message, options) {
    const modal = document.getElementById('modal-confirm');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const btnCancel = document.getElementById('btn-confirm-cancel');
    const btnAccept = document.getElementById('btn-confirm-accept');
    const iconContainer = document.getElementById('confirm-icon-container');
    const optionsContainer = document.getElementById('confirm-options-container');

    if (!modal) return Promise.resolve(null);

    iconContainer.innerHTML = `<i data-lucide="help-circle" style="width: 48px; height: 48px; stroke-width: 1.5;"></i>`;
    iconContainer.style.color = "var(--color-warning)";
    titleEl.textContent = title;
    messageEl.textContent = message;
    messageEl.style.whiteSpace = 'pre-wrap';
    messageEl.style.textAlign = 'center';

    optionsContainer.innerHTML = options.map((opt, index) => {
        return `<button class="btn-primary" style="background: var(--color-primary); color: white; padding: 10px; width: 100%; border-radius: var(--radius-sm); border: none; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; margin-bottom: 5px;" data-opt-index="${index}">${opt.text}</button>`;
    }).join('');
    optionsContainer.style.display = 'flex';

    btnCancel.style.display = 'inline-block';
    btnCancel.textContent = "Volver";
    btnAccept.style.display = 'none';

    modal.style.display = 'flex';
    lucide.createIcons();

    return new Promise((resolve) => {
        const buttons = optionsContainer.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-opt-index'));
                modal.style.display = 'none';
                optionsContainer.style.display = 'none';
                optionsContainer.innerHTML = '';
                resolve(options[idx].value);
            };
        });

        btnCancel.onclick = () => {
            modal.style.display = 'none';
            optionsContainer.style.display = 'none';
            optionsContainer.innerHTML = '';
            resolve(null);
        };
    });
};

function playNotificationSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        // Tono 1 (Re5 / D5 - 587.33 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain1.gain.setValueAtTime(0.1, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.3);

        // Tono 2 (La5 / A5 - 880.00 Hz) con retraso
        setTimeout(() => {
            try {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(880.00, ctx.currentTime);
                gain2.gain.setValueAtTime(0.1, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start();
                osc2.stop(ctx.currentTime + 0.4);
            } catch (e) {
                console.error(e);
            }
        }, 150);
    } catch (err) {
        console.warn("AudioContext block/error:", err);
    }
}

function checkUpcomingAppointments() {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Evitar interrumpir si hay otro modal abierto en pantalla
    const modalConfirm = document.getElementById('modal-confirm');
    if (modalConfirm && modalConfirm.style.display === 'flex') return;

    for (let app of state.appointments) {
        if (app.date === todayStr && !app.type.endsWith('_completed') && app.type !== 'cancelada' && app.type !== 'cirugia') {
            const startMins = timeToMinutes(app.start_time);
            const nowMins = now.getHours() * 60 + now.getMinutes();
            // Disparar exactamente en el minuto que debe iniciar la cita
            if (nowMins === startMins && !state.promptedAppointments.includes(app.id)) {
                state.promptedAppointments.push(app.id);
                playNotificationSound();
                promptStartAppointment(app);
                break;
            }
        }
    }
}

async function promptStartAppointment(app) {
    const patient = state.patients.find(p => p.id === app.patient_id);
    const patientName = patient ? patient.name : 'Paciente';
    
    const start = await confirm(
        `Es hora de iniciar la cita de las ${app.start_time} para ${patientName}. ¿Deseas comenzar la consulta?`, 
        "Cita Programada"
    );
    
    if (start) {
        openNewConsultationDirectly(app.patient_id, app.id);
    }
}

async function cancelAppointmentFromConsultationForm() {
    if (!state.currentAppointmentId) {
        alert("No hay una cita activa asociada a esta consulta para cancelar.");
        return;
    }
    
    const confirmCancel = await confirm("¿Estás seguro de que deseas cancelar esta cita del día de hoy?");
    if (!confirmCancel) return;

    const appId = state.currentAppointmentId;

    // Actualizar localmente inmediatamente
    const appIndex = state.appointments.findIndex(a => a.id === appId);
    if (appIndex !== -1) {
        state.appointments[appIndex].type = 'cancelada';
    }
    closeModal('modal-new-consultation');
    renderDashboard();
    renderCalendar();

    try {
        const { error } = await supabaseClient
            .from('appointments')
            .update({ type: 'cancelada' })
            .eq('id', appId);
        
        if (error) {
            console.error("Error al actualizar tipo en Supabase, intentando eliminar en su lugar...");
            await supabaseClient.from('appointments').delete().eq('id', appId);
            state.appointments = state.appointments.filter(a => a.id !== appId);
            renderDashboard();
            renderCalendar();
        }
    } catch (err) {
        console.error("Error al actualizar en Supabase:", err);
    }
}

// ==========================================================
// CONSULTORIO SETTINGS (DATOS DEL CONSULTORIO)
// ==========================================================
function loadClinicSettingsForm() {
    const inputDocName = document.getElementById('settings-doctor-name');
    const inputAddress = document.getElementById('settings-clinic-address');
    const inputPhone = document.getElementById('settings-owner-phone');
    const inputSocial = document.getElementById('settings-social-link');
    
    if (inputDocName) inputDocName.value = state.clinicSettings.doctor_name || '';
    if (inputAddress) inputAddress.value = state.clinicSettings.clinic_address || '';
    if (inputPhone) inputPhone.value = state.clinicSettings.owner_phone || '';
    if (inputSocial) inputSocial.value = state.clinicSettings.social_link || '';
}

async function saveClinicSettings(e) {
    e.preventDefault();
    if (!validateForm('form-settings')) return;

    const doctor_name = document.getElementById('settings-doctor-name').value;
    const clinic_address = document.getElementById('settings-clinic-address').value;
    const owner_phone = document.getElementById('settings-owner-phone').value;
    const social_link = document.getElementById('settings-social-link').value;

    const updatedSettings = {
        user_id: state.user.id,
        doctor_name,
        clinic_address,
        owner_phone,
        social_link
    };

    try {
        const { error } = await supabaseClient
            .from('clinic_settings')
            .upsert(updatedSettings);

        if (error) throw error;

        state.clinicSettings = updatedSettings;
        
        // Actualizar firma del doctor en el header
        const nameEl = document.querySelector('.doctor-name');
        if (nameEl) nameEl.textContent = doctor_name;

        alert("Los datos del consultorio han sido guardados exitosamente.", "Configuración Guardada");
    } catch (err) {
        console.error("Error al guardar configuracion:", err);
        alert("Ocurrió un error al guardar la configuración: " + err.message);
    }
}

// ==========================================================
// GENERADOR DE LINK DE CITA DE UN SOLO USO
// ==========================================================
function initLinkgenPage() {
    document.getElementById('form-linkgen').reset();
    document.getElementById('generated-link-box').style.display = 'none';
    
    // Auto-rellenar fecha de hoy
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('link-date').value = `${yyyy}-${mm}-${dd}`;
    
    // Auto-completar fin de cita +30 min
    const startInput = document.getElementById('link-start-time');
    const endInput = document.getElementById('link-end-time');
    if (startInput && endInput) {
        startInput.addEventListener('change', () => {
            const val = startInput.value;
            if (val) {
                const [h, m] = val.split(':').map(Number);
                let endM = m + 30;
                let endH = h;
                if (endM >= 60) {
                    endM -= 60;
                    endH = (endH + 1) % 24;
                }
                endInput.value = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
            }
        });
    }
}

async function generateAppointmentLink(e) {
    e.preventDefault();
    if (!validateForm('form-linkgen')) return;

    const date = document.getElementById('link-date').value;
    const start_time = document.getElementById('link-start-time').value;
    const end_time = document.getElementById('link-end-time').value;

    try {
        const { data, error } = await supabaseClient
            .from('appointment_links')
            .insert([{
                created_by: state.user.id,
                date,
                start_time,
                end_time,
                is_used: false
            }])
            .select()
            .single();

        if (error) throw error;

        const sharedUrl = `${window.location.origin}${window.location.pathname}?linkId=${data.id}`;
        
        document.getElementById('input-shared-link').value = sharedUrl;
        document.getElementById('generated-link-box').style.display = 'flex';
    } catch (err) {
        console.error("Error al generar link:", err);
        alert("No se pudo generar el enlace: " + err.message);
    }
}

function copySharedLink() {
    const input = document.getElementById('input-shared-link');
    if (!input) return;
    input.select();
    document.execCommand('copy');
    alert("Enlace copiado al portapapeles. Compártelo con tu paciente.", "Copiado");
}

// Detectar y procesar link público del paciente al cargar
async function checkPublicAppointmentLink() {
    const birthInput = document.getElementById('pub-p-birth');
    if (birthInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const maxDate = `${yyyy}-${mm}-${dd}`;
        
        const minYear = yyyy - 120;
        const minDate = `${minYear}-${mm}-${dd}`;
        
        birthInput.setAttribute('max', maxDate);
        birthInput.setAttribute('min', minDate);
    }

    const params = new URLSearchParams(window.location.search);
    const linkId = params.get('linkId');
    if (!linkId) return;

    // Remover parametro de la URL limpiamente sin recargar
    window.history.replaceState({}, document.title, window.location.pathname);

    try {
        // Consultar validez del link
        const { data: linkData, error: linkError } = await supabaseClient
            .from('appointment_links')
            .select('*')
            .eq('id', linkId)
            .single();

        if (linkError || !linkData) {
            alert("El enlace de cita no es válido o ha expirado.", "Enlace Inválido");
            return;
        }

        if (linkData.is_used) {
            alert("Este enlace ya fue utilizado para agendar una cita. Por favor, solicita uno nuevo.", "Enlace Usado");
            return;
        }

        // Obtener el enlace de la red social de la doctora
        let doctorSocialLink = '';
        const { data: settingsData } = await supabaseClient
            .from('clinic_settings')
            .select('social_link')
            .eq('user_id', linkData.created_by)
            .maybeSingle();
        if (settingsData) {
            doctorSocialLink = settingsData.social_link || '';
        }

        // Abrir un modal especial para el paciente (reutilizando modal-patient)
        openPublicPatientRegistrationModal(linkData, doctorSocialLink);
    } catch (err) {
        console.error(err);
    }
}

function openPublicPatientRegistrationModal(linkData, doctorSocialLink) {
    // Esconder vistas de la doctora
    const loginView = document.getElementById('auth-login-view');
    const registerView = document.getElementById('auth-register-view');
    if (loginView) loginView.style.display = 'none';
    if (registerView) registerView.style.display = 'none';

    // Mostrar contenedor de login y la vista de paciente
    const loginContainer = document.getElementById('login-container');
    const patientView = document.getElementById('auth-patient-view');
    if (loginContainer) loginContainer.style.display = 'flex';
    if (patientView) patientView.style.display = 'flex';

    // Actualizar título informativo
    const title = document.getElementById('patient-view-title');
    if (title) {
        title.textContent = `Reservar Cita: ${linkData.date} a las ${linkData.start_time}`;
    }

    const form = document.getElementById('form-public-patient');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        if (!validateForm('form-public-patient')) return;

        const id = document.getElementById('pub-p-id').value;
        const name = document.getElementById('pub-p-name').value;
        const phone = document.getElementById('pub-p-phone').value;
        const birth_date = document.getElementById('pub-p-birth').value;

        try {
            // 1. Validar e insertar paciente
            const { data: existingPatient } = await supabaseClient.from('patients').select('*').eq('id', id).maybeSingle();
            
            if (!existingPatient) {
                const { error: patErr } = await supabaseClient.from('patients').insert([{
                    id, name, phone, birth_date, history: [], created_by: linkData.created_by
                }]);
                if (patErr) throw patErr;
            }

            // 2. Insertar cita en base de datos
            const { error: appErr } = await supabaseClient.from('appointments').insert([{
                id: 'app-' + Date.now(),
                patient_id: id,
                date: linkData.date,
                start_time: linkData.start_time,
                end_time: linkData.end_time,
                type: 'consulta'
            }]);
            if (appErr) throw appErr;

            // 3. Quemar el link de un solo uso
            const { error: linkUpdateErr } = await supabaseClient
                .from('appointment_links')
                .update({ is_used: true })
                .eq('id', linkData.id);
            if (linkUpdateErr) throw linkUpdateErr;

            // Formatear fecha bonita
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateObj = new Date(linkData.date.replace(/-/g, '\/'));
            const formattedDate = dateObj.toLocaleDateString('es-ES', options);
            const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

            const startTimeFormatted = linkData.start_time ? linkData.start_time.substring(0, 5) : '';
            const endTimeFormatted = linkData.end_time ? linkData.end_time.substring(0, 5) : '';

            // Llenar detalles del éxito
            const successPatName = document.getElementById('success-patient-name');
            const successAppDate = document.getElementById('success-appointment-date');
            const successAppTime = document.getElementById('success-appointment-time');
            if (successPatName) successPatName.textContent = name;
            if (successAppDate) successAppDate.textContent = capitalizedDate;
            if (successAppTime) successAppTime.textContent = `${startTimeFormatted} - ${endTimeFormatted}`;

            // Configurar botón de acción único
            const btnSuccessAction = document.getElementById('btn-success-action');
            const successActionIcon = document.getElementById('success-action-icon');
            const successActionText = document.getElementById('success-action-text');
            const socialInviteText = document.getElementById('social-invite-text');

            if (btnSuccessAction) {
                if (doctorSocialLink) {
                    let iconName = 'external-link';
                    let textValue = '¡Visitar mis Redes Sociales!';
                    let btnBackground = 'var(--color-primary)';
                    
                    const urlLower = doctorSocialLink.toLowerCase();
                    if (urlLower.includes('instagram.com')) {
                        iconName = 'instagram';
                        textValue = '¡Sígueme en Instagram!';
                        btnBackground = 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';
                    } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
                        iconName = 'facebook';
                        textValue = '¡Sígueme en Facebook!';
                        btnBackground = '#1877f2';
                    } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
                        iconName = 'twitter';
                        textValue = '¡Sígueme en X (Twitter)!';
                        btnBackground = '#000000';
                    } else if (urlLower.includes('tiktok.com')) {
                        iconName = 'video';
                        textValue = '¡Sígueme en TikTok!';
                        btnBackground = '#010101';
                    } else if (urlLower.includes('youtube.com')) {
                        iconName = 'youtube';
                        textValue = '¡Suscríbete en YouTube!';
                        btnBackground = '#ff0000';
                    }
                    
                    if (successActionIcon) successActionIcon.setAttribute('data-lucide', iconName);
                    if (successActionText) successActionText.textContent = textValue;
                    btnSuccessAction.style.background = btnBackground;
                    btnSuccessAction.style.border = 'none';
                    btnSuccessAction.style.color = 'white';
                    if (socialInviteText) socialInviteText.style.display = 'block';

                    btnSuccessAction.onclick = () => {
                        window.open(doctorSocialLink, '_blank');
                        window.location.reload();
                    };
                } else {
                    if (successActionIcon) successActionIcon.setAttribute('data-lucide', 'check-circle');
                    if (successActionText) successActionText.textContent = 'Entendido';
                    btnSuccessAction.style.background = 'var(--color-primary)';
                    btnSuccessAction.style.border = 'none';
                    btnSuccessAction.style.color = 'white';
                    if (socialInviteText) socialInviteText.style.display = 'none';

                    btnSuccessAction.onclick = () => {
                        window.location.reload();
                    };
                }
            }

            // Ocultar formulario de paciente y mostrar pantalla de éxito
            if (patientView) patientView.style.display = 'none';
            const successView = document.getElementById('auth-success-view');
            if (successView) successView.style.display = 'flex';

            // Crear iconos de Lucide en la nueva vista
            if (window.lucide) {
                window.lucide.createIcons();
            }
        } catch (err) {
            console.error("Error al registrar paciente público:", err);
            alert("Ocurrió un error al agendar tu cita: " + (err.message || JSON.stringify(err)));
        }
    };
}

// ==========================================================
// SISTEMA DE NOTIFICACIONES PREMIUM (REAL-TIME Y CERCANÍA DE CITA)
// ==========================================================
function toggleNotificationsPanel(event) {
    event.stopPropagation();
    const panel = document.getElementById('notifications-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    }
}

function addNotification(title, message, type = 'info', metadata = null) {
    // Estilo móvil centrado absoluto y desktop a la derecha
    const notif = {
        id: Date.now(),
        title,
        message,
        type,
        metadata,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.notifications.unshift(notif);
    playNotificationSound();
    renderNotifications();
    showToastNotification(notif);
}

function renderNotifications() {
    const list = document.getElementById('notifications-list');
    const badge = document.getElementById('notification-badge');
    const badgeMobile = document.getElementById('notification-badge-mobile');

    if (!list) return;

    if (state.notifications.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0;">No tienes nuevas notificaciones.</div>`;
        if (badge) badge.style.display = 'none';
        if (badgeMobile) badgeMobile.style.display = 'none';
        return;
    }

    // Actualizar badges con contador
    if (badge) {
        badge.textContent = state.notifications.length;
        badge.style.display = 'inline-flex';
    }
    if (badgeMobile) {
        badgeMobile.textContent = state.notifications.length;
        badgeMobile.style.display = 'inline-flex';
    }

    list.innerHTML = state.notifications.map(n => {
        let icon = 'info';
        let color = 'var(--color-primary)';
        if (n.type === 'warning') { icon = 'alert-triangle'; color = 'var(--color-warning)'; }
        if (n.type === 'success') { icon = 'check-circle'; color = 'var(--color-success)'; }

        const patientId = n.metadata ? n.metadata.patientId : '';
        const clickHandler = patientId ? `onclick="handleNotificationClick('${patientId}', event)"` : '';
        const itemClass = patientId ? 'class="notification-item" style="cursor: pointer; display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid var(--border-color); align-items: flex-start; text-align: left;"' : 'style="display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid var(--border-color); align-items: flex-start; text-align: left;"';

        return `
            <div ${clickHandler} ${itemClass}>
                <i data-lucide="${icon}" style="width: 18px; height: 18px; color: ${color}; flex-shrink: 0; margin-top: 2px;"></i>
                <div style="flex-grow: 1;">
                    <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${n.title}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.3;">${n.message}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">${n.time}</div>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

function clearNotifications() {
    state.notifications = [];
    renderNotifications();
}

function handleNotificationClick(patientId, event) {
    if (event) event.stopPropagation();
    
    // Cerrar el panel de notificaciones
    const panel = document.getElementById('notifications-panel');
    if (panel) panel.style.display = 'none';

    // Abrir historia clínica
    openClinicalHistory(patientId);
}

// Toast flotante tipo teléfono móvil/escritorio
function showToastNotification(notif) {
    const toast = document.createElement('div');
    toast.className = 'card';
    toast.style.position = 'fixed';
    toast.style.zIndex = '999999';
    toast.style.width = '300px';
    toast.style.padding = '12px 16px';
    toast.style.display = 'flex';
    toast.style.alignItems = 'flex-start';
    toast.style.gap = '12px';
    toast.style.boxShadow = 'var(--shadow-lg)';
    toast.style.border = '1px solid var(--border-color)';
    toast.style.borderRadius = 'var(--radius-md)';
    toast.style.animation = 'slideInNotification 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    toast.style.transition = 'all 0.3s';

    // Responsividad: en móvil al centro superior, en desktop a la derecha
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
    } else {
        toast.style.bottom = '20px';
        toast.style.right = '20px';
    }

    let icon = 'info';
    let color = 'var(--color-primary)';
    if (notif.type === 'warning') { icon = 'alert-triangle'; color = 'var(--color-warning)'; }
    if (notif.type === 'success') { icon = 'check-circle'; color = 'var(--color-success)'; }

    toast.innerHTML = `
        <i data-lucide="${icon}" style="width: 20px; height: 20px; color: ${color}; flex-shrink: 0; margin-top: 2px;"></i>
        <div style="flex-grow: 1; text-align: left;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${notif.title}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.3;">${notif.message}</div>
        </div>
        <button style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--text-muted); align-self: flex-start; line-height: 1;" onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(toast);
    lucide.createIcons();

    // Auto-remover a los 5 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Inyectar estilos para animación de toast de notificación si no están en CSS
const styleEl = document.createElement('style');
styleEl.innerHTML = `
@keyframes slideInNotification {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
.blink-blue {
    animation: blinkBlueBg 2s infinite alternate;
}
@keyframes blinkBlueBg {
    from { background-color: transparent; }
    to { background-color: rgba(56, 189, 248, 0.15); }
}
`;
document.head.appendChild(styleEl);

// Modificar monitoreo de recordatorios en tiempo real para disparar a los 5 minutos antes
// Además de chequear en Supabase si se han registrado nuevos pacientes

async function checkRealtimeNotifications() {
    if (!state.user) return;

    // 1. Chequear si se registró un nuevo paciente mediante link público
    try {
        const { count, error } = await supabaseClient
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', state.user.id);
        
        if (!error && count !== null) {
            if (lastPatientsCount > 0 && count > lastPatientsCount) {
                // Alguien se registró
                await refreshStateFromSupabase();
                // Obtener el paciente más nuevo
                const sortedPatients = [...state.patients].sort((a,b) => b.id.localeCompare(a.id)); // o por fecha si existiera
                const newestPatient = sortedPatients[0];
                if (newestPatient) {
                    addNotification("Nuevo Paciente Registrado", `El paciente ${newestPatient.name} se registró mediante un enlace de cita.`, "success", { patientId: newestPatient.id });
                }
            }
            lastPatientsCount = count;
        }
    } catch (err) {
        console.error(err);
    }

    // 2. Alarma a los 5 minutos antes de la cita
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    for (let app of state.appointments) {
        if (app.date === todayStr && !app.type.endsWith('_completed') && app.type !== 'cancelada') {
            const startMins = timeToMinutes(app.start_time);
            const nowMins = now.getHours() * 60 + now.getMinutes();
            const diff = startMins - nowMins;

            // Disparar notificación exactamente 5 minutos antes
            const alarmKey = `${app.id}_5min`;
            if (diff === 5 && !state.promptedAppointments.includes(alarmKey)) {
                state.promptedAppointments.push(alarmKey);
                
                const patient = state.patients.find(p => p.id === app.patient_id);
                const name = patient ? patient.name : 'Paciente';
                const label = app.type === 'cirugia' ? 'cirugía' : 'consulta';
                
                addNotification(
                    "Cita Próxima (En 5 Minutos)",
                    `La ${label} de ${name} está programada para iniciar a las ${app.start_time.substring(0, 5)}.`,
                    "warning",
                    { patientId: app.patient_id }
                );
            }
        }
    }
}

// Iniciar monitoreo del link público al iniciar la app
document.addEventListener('DOMContentLoaded', () => {
    checkPublicAppointmentLink();
    
    // Configurar timers de monitoreo
    setInterval(checkRealtimeNotifications, 15000);
});

// Cerrar panel de notificaciones al hacer clic afuera
document.addEventListener('click', (e) => {
    const panel = document.getElementById('notifications-panel');
    if (panel && panel.style.display === 'flex' && !e.target.closest('#notifications-panel') && !e.target.closest('button[onclick="toggleNotificationsPanel(event)"]')) {
        panel.style.display = 'none';
    }
});

// Exponer funciones globales al objeto Window para evitar errores de compilación/ejecución
window.toggleAuthView = toggleAuthView;
window.loginWithEmail = loginWithEmail;
window.registerWithEmail = registerWithEmail;
window.switchPage = switchPage;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.saveClinicSettings = saveClinicSettings;
window.generateAppointmentLink = generateAppointmentLink;
window.copySharedLink = copySharedLink;
window.toggleNotificationsPanel = toggleNotificationsPanel;
window.clearNotifications = clearNotifications;
window.toggleSelectAllDashboard = toggleSelectAllDashboard;
window.updateSelectAllState = updateSelectAllState;
window.handleNotificationClick = handleNotificationClick;
window.triggerDeleteCurrentPatient = triggerDeleteCurrentPatient;
