/**
 * site.js
 * Main JavaScript file for Pharma E-Log Book
 * Handles UI interactions and Mock API calls
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Pharma E-Log Book System Initialized');
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // Handle Active Menu State
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('#sidebar ul li a');
    
    menuItems.forEach(item => {
        if(item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });

    // Initialize Auto Logout
    initAutoLogout();
});

/**
 * AUTO LOGOUT FUNCTIONALITY
 * Logs out user after 5 minutes of inactivity
 */
function initAutoLogout() {
    // 5 minutes in milliseconds
    const INACTIVITY_LIMIT = 5 * 60 * 1000; 
    let logoutTimer;

    function resetTimer() {
        clearTimeout(logoutTimer);
        // Only set timer if we are NOT on the login page
        if (!window.location.pathname.toLowerCase().includes('login')) {
            logoutTimer = setTimeout(logoutUser, INACTIVITY_LIMIT);
        }
    }

    function logoutUser() {
        // Logic to clear session/tokens would go here
        alert("Session expired due to inactivity. You will be logged out.");
        window.location.href = '/Account/Login';
    }

    // Listen for user activity
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.ontouchstart = resetTimer; // For mobile
    document.onclick = resetTimer;      // catches touchpad clicks
    document.onscroll = resetTimer;     // catches scrolling
}

/**
 * MOCK DATA SERVICES
 * In a real application, these would be fetch() calls to the API
 */

const MockApi = {
    // Equipment Data
    getEquipmentList: () => {
        return [
            { id: "EQ-001", name: "Bioreactor B-200", type: "Bioreactor", location: "Zone A", status: "Active" },
            { id: "EQ-002", name: "Autoclave A-10", type: "Sterilization", location: "Zone B", status: "Maintenance" },
            { id: "EQ-003", name: "HPLC System 04", type: "Lab Instrument", location: "QC Lab", status: "Active" },
            { id: "EQ-004", name: "Filling Line 02", type: "Packaging", location: "Zone C", status: "Active" },
            { id: "EQ-005", name: "Lyophilizer L-01", type: "Production", location: "Zone A", status: "Inactive" }
        ];
    },

    // Recent Activities Data
    getRecentActivities: () => {
        return [
            { time: "08:30 AM", user: "John Doe", action: "Log Entry Created", details: "Bioreactor B-200 pH Check" },
            { time: "09:15 AM", user: "Sarah Smith", action: "Maintenance Started", details: "Autoclave A-10 Routine Check" },
            { time: "10:00 AM", user: "Mike Ross", action: "Approval Granted", details: "Batch Record #4421" },
            { time: "11:45 AM", user: "John Doe", action: "Equipment Status Change", details: "HPLC 04 -> Active" }
        ];
    }
};

/**
 * Dashboard Functions
 */
function loadDashboardData() {
    const activities = MockApi.getRecentActivities();
    const tableBody = document.getElementById('recentActivitiesBody');
    
    if (tableBody) {
        tableBody.innerHTML = '';
        activities.forEach(act => {
            const row = `
                <tr>
                    <td><span class="text-muted">${act.time}</span></td>
                    <td><strong>${act.user}</strong></td>
                    <td>${act.action}</td>
                    <td>${act.details}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }
}

/**
 * Equipment Functions
 */
function loadEquipmentList() {
    const equipment = MockApi.getEquipmentList();
    const tableBody = document.getElementById('equipmentTableBody');
    
    if (tableBody) {
        tableBody.innerHTML = '';
        equipment.forEach(eq => {
            let statusClass = 'status-active';
            if (eq.status === 'Maintenance') statusClass = 'status-maintenance';
            if (eq.status === 'Inactive') statusClass = 'status-inactive';

            const row = `
                <tr>
                    <td><code>${eq.id}</code></td>
                    <td>${eq.name}</td>
                    <td>${eq.type}</td>
                    <td>${eq.location}</td>
                    <td><span class="status-badge ${statusClass}">${eq.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-info"><i class="bi bi-eye"></i></button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }
}

/**
 * Form Handling
 */
function handleLogin(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const originalText = btn.innerHTML;
    
    // Reset previous error states
    usernameInput.classList.remove('is-invalid');
    passwordInput.classList.remove('is-invalid');

    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Authenticating...';
    btn.disabled = true;

    // Simulate API delay
    setTimeout(() => {
        // Mock Credential Check
        if (usernameInput.value === 'admin' && passwordInput.value === 'admin') {
            // Success
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', 'admin');
            window.location.href = '/Dashboard/Index';
        } else {
            // Failure
            btn.innerHTML = originalText;
            btn.disabled = false;
            
            // Show error (visual feedback)
            usernameInput.classList.add('is-invalid');
            passwordInput.classList.add('is-invalid');
            
            // Optional: Create/Show an alert if one doesn't exist
            let alertBox = document.getElementById('loginAlert');
            if(!alertBox) {
                const alertDiv = document.createElement('div');
                alertDiv.id = 'loginAlert';
                alertDiv.className = 'alert alert-danger mt-3 small';
                alertDiv.innerHTML = '<i class="bi bi-exclamation-circle-fill"></i> Invalid username or password.';
                event.target.appendChild(alertDiv);
            }
        }
    }, 1000);
}

function handleFormSubmit(event, redirectUrl) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    
    // Basic Client-side Validation
    if (!event.target.checkValidity()) {
        event.stopPropagation();
        event.target.classList.add('was-validated');
        return;
    }

    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    btn.disabled = true;

    // Simulate API Call
    setTimeout(() => {
        alert('Record saved successfully!');
        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else {
            btn.innerHTML = 'Save';
            btn.disabled = false;
            event.target.reset();
            event.target.classList.remove('was-validated');
        }
    }, 1000);
}
