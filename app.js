// ==========================================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================================

let state = {
    patients: JSON.parse(localStorage.getItem('appgene_patients')) || [],
    appointments: JSON.parse(localStorage.getItem('appgene_appointments')) || [],
    currentPatientId: null,
    currentDate: new Date(),
    theme: localStorage.getItem('appgene_theme') || 'light'
};

function saveState() {
    localStorage.setItem('appgene_patients', JSON.stringify(state.patients));
    localStorage.setItem('appgene_appointments', JSON.stringify(state.appointments));
    localStorage.setItem('appgene_theme', state.theme);
}

// ==========================================================
// INITIALIZATION
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    // Aplicar tema guardado
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeUI();

    // Lucide Icons init
    lucide.createIcons();

    // Rellenar datos de prueba si el almacenamiento está vacío para que se vea completo
    if (state.patients.length === 0) {
        loadMockData();
    }

    // Renderizar Vistas iniciales
    renderDashboard();
    renderPatients();
    renderCalendar();
    populatePatientSelect();

    // Escuchar cambios en el formulario de nueva consulta para actualizar la vista previa de WhatsApp
    const formNewConsultation = document.getElementById('form-new-consultation');
    if (formNewConsultation) {
        formNewConsultation.addEventListener('input', updateWhatsAppPreview);
    }
});

// ==========================================================
// MOCK DATA LOAD
// ==========================================================
function loadMockData() {
    state.patients = [
        {
            id: "123456",
            name: "Armando Rondón",
            phone: "584121234567",
            birthDate: "1995-05-12",
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
            birthDate: "1988-11-23",
            history: []
        }
    ];

    state.appointments = [
        {
            id: "app-1",
            patientId: "123456",
            date: new Date().toISOString().split('T')[0], // hoy
            startTime: "09:00",
            endTime: "10:00",
            type: "consulta"
        },
        {
            id: "app-2",
            patientId: "789012",
            date: new Date().toISOString().split('T')[0], // hoy
            startTime: "11:00",
            endTime: "12:30",
            type: "cirugia"
        }
    ];
    saveState();
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
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    saveState();
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
    document.getElementById('scheduler-alert').style.display = 'none';
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

function savePatient(e) {
    e.preventDefault();
    const id = document.getElementById('p-id').value;
    const name = document.getElementById('p-name').value;
    const phone = document.getElementById('p-phone').value;
    const birthDate = document.getElementById('p-birth').value;

    if (state.patients.some(p => p.id === id)) {
        alert("Ya existe un paciente registrado con ese documento de identidad.");
        return;
    }

    state.patients.push({ id, name, phone, birthDate, history: [] });
    saveState();
    closeModal('modal-patient');
    renderPatients();
    renderDashboard();
    populatePatientSelect();
}

function renderPatients() {
    const listTable = document.getElementById('patients-list-table');
    if (!listTable) return;

    listTable.innerHTML = state.patients.map(p => `
        <tr style="border-bottom: 1px solid var(--border-color); hover:background-color: var(--bg-surface-hover);">
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

function deletePatient(patientId) {
    const patient = state.patients.find(p => p.id === patientId);
    if (!patient) return;

    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${patient.name}? También se borrarán sus citas programadas.`);
    if (!confirmDelete) return;

    // Filtrar paciente y citas
    state.patients = state.patients.filter(p => p.id !== patientId);
    state.appointments = state.appointments.filter(app => app.patientId !== patientId);

    saveState();
    renderPatients();
    renderDashboard();
    renderCalendar();
    populatePatientSelect();
}

function triggerDeleteCurrentPatient() {
    if (!state.currentPatientId) return;
    deletePatient(state.currentPatientId);
    closeModal('modal-clinical-history');
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
            const appStart = new Date(`${app.date}T${app.startTime}`);
            const appEnd = new Date(`${app.date}T${app.endTime}`);

            // Validar solapamiento: (StartA < EndB) y (EndA > StartB)
            if (start < appEnd && end > appStart) {
                // Si cualquiera de las dos citas en conflicto es cirugia, es solapamiento critico
                if (app.type === 'cirugia' || document.getElementById('app-type').value === 'cirugia') {
                    return true;
                }
                // Si coinciden en la misma hora exacta para consulta, tambien choca
                if (app.startTime === startTime) {
                    return true;
                }
            }
        }
    }
    return false;
}

function saveAppointment(e) {
    e.preventDefault();
    const patientId = document.getElementById('app-patient-select').value;
    const date = document.getElementById('app-date').value;
    const type = document.getElementById('app-type').value;
    const startTime = document.getElementById('app-start-time').value;
    const endTime = document.getElementById('app-end-time').value;

    if (checkCollision(date, startTime, endTime)) {
        document.getElementById('scheduler-alert').style.display = 'block';
        return;
    }

    state.appointments.push({
        id: 'app-' + Date.now(),
        patientId,
        date,
        type,
        startTime,
        endTime
    });

    saveState();
    closeModal('modal-appointment');
    renderCalendar();
    renderDashboard();
}

// ==========================================================
// HISTORIA CLINICA Y WHATSAPP GENERATOR
// ==========================================================
function openClinicalHistory(patientId) {
    state.currentPatientId = patientId;
    const patient = state.patients.find(p => p.id === patientId);
    if (!patient) return;

    document.getElementById('ch-patient-title').textContent = `Historia Clínica - ${patient.name}`;
    document.getElementById('form-new-consultation').reset();
    
    renderTimeline(patient);
    updateWhatsAppPreview();
    
    document.getElementById('modal-clinical-history').style.display = 'flex';
    lucide.createIcons();
}

function showClinicalSubtab(tab) {
    document.querySelectorAll('.clinical-subtab').forEach(el => el.style.display = 'none');
    document.getElementById(`subtab-${tab}`).style.display = 'block';
}

function openNewConsultationFromCurrent() {
    closeModal('modal-clinical-history');
    document.getElementById('form-new-consultation').reset();
    
    const patient = state.patients.find(p => p.id === state.currentPatientId);
    if (patient) {
        document.getElementById('new-consultation-title').textContent = `Registrar Consulta de Hoy - ${patient.name}`;
    }
    
    document.getElementById('modal-new-consultation').style.display = 'flex';
    lucide.createIcons();
}

function renderTimeline(patient) {
    const timeline = document.getElementById('clinical-records-timeline');
    if (!timeline) return;

    if (patient.history.length === 0) {
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

function updateWhatsAppPreview() {
    // Ya no es necesario actualizar un contenedor visible de previsualización en el DOM
}

function generateAndSendWhatsApp() {
    const patient = state.patients.find(p => p.id === state.currentPatientId);
    if (!patient) return;

    const prescription = document.getElementById('c-prescription').value || "Sin indicaciones adicionales.";
    const notes = document.getElementById('c-notes').value || "Evaluación de rutina sin hallazgos inusuales.";
    const nextDate = document.getElementById('c-next-appointment').value;

    let message = `Saludos, ${patient.name}

En la consulta de hoy se determinaron las siguientes observaciones:
${notes}

Tratamiento e indicaciones a seguir:
${prescription}`;

    if (nextDate) {
        message += `\n\nPróxima cita programada: ${nextDate}`;
    }

    const cleanPhone = patient.phone.replace(/[^0-9]/g, ''); // solo dígitos
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function saveConsultation(e) {
    e.preventDefault();
    const patientIndex = state.patients.findIndex(p => p.id === state.currentPatientId);
    if (patientIndex === -1) return;

    const newRecord = {
        date: new Date().toISOString().split('T')[0],
        notes: document.getElementById('c-notes').value,
        prescription: document.getElementById('c-prescription').value,
        nextAppointment: document.getElementById('c-next-appointment').value || null,
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

    // Asegurar inserción al inicio (más reciente arriba)
    state.patients[patientIndex].history.unshift(newRecord);
    
    // Si la doctora seteó una próxima cita, la agregamos a la agenda automáticamente
    if (newRecord.nextAppointment) {
        state.appointments.push({
            id: 'app-' + Date.now(),
            patientId: state.currentPatientId,
            date: newRecord.nextAppointment,
            type: 'control',
            startTime: "09:00",
            endTime: "09:30"
        });
    }

    saveState();
    closeModal('modal-new-consultation');
    renderPatients();
    renderDashboard();
    renderCalendar();
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
                    const patient = state.patients.find(p => p.id === app.patientId);
                    const name = patient ? patient.name.split(' ')[0] : 'Pac.';
                    return `<span class="badge-event badge-${app.type}" title="${app.startTime} - ${app.type.toUpperCase()}: ${name}">${app.startTime} ${name}</span>`;
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

    // Tabla del dia
    const todayEventsList = document.getElementById('today-events-list');
    if (!todayEventsList) return;

    if (todayApps.length === 0) {
        todayEventsList.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">No tienes citas o cirugías programadas para hoy.</td></tr>`;
        return;
    }

    // Ordenar por hora
    todayApps.sort((a,b) => a.startTime.localeCompare(b.startTime));

    todayEventsList.innerHTML = todayApps.map(app => {
        const patient = state.patients.find(p => p.id === app.patientId);
        const patientName = patient ? patient.name : 'Desconocido';
        const typeBadge = `<span class="badge-event badge-${app.type}" style="display:inline-block; padding: 4px 8px;">${app.type === 'cirugia' ? 'Cirugía' : app.type === 'consulta' ? 'Consulta' : 'Control'}</span>`;
        return `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 16px; font-weight:600;">${app.startTime} - ${app.endTime}</td>
                <td style="padding: 16px;">${patientName}</td>
                <td style="padding: 16px;">${typeBadge}</td>
                <td style="padding: 16px;">
                    ${app.type !== 'cirugia' ? `<button class="btn-primary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="openClinicalHistory('${app.patientId}')">Iniciar Consulta</button>` : 'N/A'}
                </td>
            </tr>
        `;
    }).join('');
}

// Búsqueda global
function handleGlobalSearch() {
    const query = document.getElementById('global-search').value.toLowerCase().trim();
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
