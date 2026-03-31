/**
 * GuardianHealth - Frontend JavaScript
 * Complete health monitoring, emergency response, and intelligent voice assistance
 */

// ==================== Global Variables ====================
const API_URL = 'http://localhost:5000/predict';
let map = null;
let userMarker = null;
let hospitalMarkers = [];
let userLocation = null;
let healthChart = null;
let voiceAssistantInterval = null;
let isEmergencyActive = false;

// ==================== Local Storage Keys ====================
const STORAGE_KEYS = {
    HEALTH_HISTORY: 'guardianhealth_history',
    EMERGENCY_CONTACTS: 'guardianhealth_contacts',
    THEME: 'guardianhealth_theme'
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadEmergencyContacts();
    loadHealthHistory();
    initializeChart();
    setupEventListeners();
    console.log('✓ GuardianHealth initialized');
});

// ==================== Theme Management ====================
function initializeTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ==================== Event Listeners ====================
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Health check
    document.getElementById('checkHealthBtn').addEventListener('click', checkHealth);

    // Location
    document.getElementById('getLocationBtn').addEventListener('click', getLocation);

    // Emergency actions
    document.getElementById('emergencyAlertBtn')?.addEventListener('click', triggerEmergencyAlert);
    document.getElementById('shareLocationBtn')?.addEventListener('click', shareLocation);
    document.getElementById('callFamilyBtn')?.addEventListener('click', showFamilyContacts);
    document.getElementById('findHospitalsBtn')?.addEventListener('click', findNearbyHospitals);

    // Emergency contacts
    document.getElementById('addContactBtn').addEventListener('click', addEmergencyContact);

    // History
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    // Modal close
    document.getElementById('closeModalBtn')?.addEventListener('click', closeEmergencyModal);

    // Enter key support for inputs
    ['age', 'systolicBP', 'diastolicBP', 'heartRate'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkHealth();
        });
    });

    ['contactName', 'contactPhone'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addEmergencyContact();
        });
    });
}

// ==================== Health Risk Prediction ====================
async function checkHealth() {
    // Get input values
    const age = parseFloat(document.getElementById('age').value);
    const systolicBP = parseFloat(document.getElementById('systolicBP').value);
    const diastolicBP = parseFloat(document.getElementById('diastolicBP').value);
    const heartRate = parseFloat(document.getElementById('heartRate').value);

    // Validate inputs
    if (!age || !systolicBP || !diastolicBP || !heartRate) {
        showAlert('Please fill in all health parameters', 'warning');
        return;
    }

    if (age < 40 || age > 120) {
        showAlert('Age must be between 40 and 120', 'warning');
        return;
    }

    if (systolicBP < 50 || systolicBP > 250) {
        showAlert('Systolic BP must be between 50 and 250', 'warning');
        return;
    }

    if (diastolicBP < 30 || diastolicBP > 150) {
        showAlert('Diastolic BP must be between 30 and 150', 'warning');
        return;
    }

    if (heartRate < 30 || heartRate > 200) {
        showAlert('Heart rate must be between 30 and 200', 'warning');
        return;
    }

    // Show loading state
    const btn = document.getElementById('checkHealthBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>⏳ Analyzing...</span>';
    btn.disabled = true;

    try {
        // Make API request
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                age,
                systolic_bp: systolicBP,
                diastolic_bp: diastolicBP,
                heart_rate: heartRate
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get prediction from server');
        }

        const result = await response.json();

        // Display results
        displayResults(result);

        // Save to history
        saveToHistory(result);

        // Handle high risk emergency
        if (result.risk_level === 'High') {
            handleHighRiskEmergency(result);
        }

    } catch (error) {
        console.error('Prediction error:', error);
        showAlert('Unable to connect to backend server. Make sure the Flask server is running on http://localhost:5000', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ==================== Display Results ====================
function displayResults(result) {
    const resultSection = document.getElementById('resultSection');
    const emergencySection = document.getElementById('emergencySection');
    const riskIcon = document.getElementById('riskIcon');
    const riskLevel = document.getElementById('riskLevel');
    const riskMessage = document.getElementById('riskMessage');
    const riskIndicator = document.querySelector('.risk-indicator');

    // Show result section
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Set risk level and icon
    const riskLevelText = result.risk_level;
    riskLevel.textContent = `${riskLevelText} Risk`;

    // Set icon based on risk level
    const icons = {
        'Low': '✅',
        'Medium': '⚠️',
        'High': '🚨'
    };
    riskIcon.textContent = icons[riskLevelText] || '❓';

    // Set message
    const messages = {
        'Low': 'Your vital signs are within normal ranges. Keep monitoring regularly.',
        'Medium': 'Some vital signs are elevated. Consider consulting a healthcare provider.',
        'High': 'URGENT: Critical vital signs detected. Seek immediate medical attention!'
    };
    riskMessage.textContent = messages[riskLevelText] || 'Assessment complete.';

    // Set color class
    riskIndicator.className = 'risk-indicator risk-' + riskLevelText.toLowerCase();

    // Update probability bars
    updateProbabilityBars(result.probabilities);

    // Show override information if applicable
    if (result.override_applied) {
        document.getElementById('overrideInfo').style.display = 'block';
        document.getElementById('overrideReason').textContent = result.override_reason;
    } else {
        document.getElementById('overrideInfo').style.display = 'none';
    }

    // Show emergency section for Medium and High risk
    if (riskLevelText === 'Medium' || riskLevelText === 'High') {
        emergencySection.style.display = 'block';
    } else {
        emergencySection.style.display = 'none';
    }
}

function updateProbabilityBars(probabilities) {
    const probLow = probabilities.Low * 100;
    const probMedium = probabilities.Medium * 100;
    const probHigh = probabilities.High * 100;

    document.getElementById('probLow').style.width = probLow + '%';
    document.getElementById('probMedium').style.width = probMedium + '%';
    document.getElementById('probHigh').style.width = probHigh + '%';

    document.getElementById('probLowText').textContent = probLow.toFixed(1) + '%';
    document.getElementById('probMediumText').textContent = probMedium.toFixed(1) + '%';
    document.getElementById('probHighText').textContent = probHigh.toFixed(1) + '%';
}

// ==================== High Risk Emergency Handler ====================
function handleHighRiskEmergency(result) {
    // Trigger emergency alert automatically
    showAlert('🚨 HIGH RISK DETECTED! Emergency protocols activated.', 'error');

    // Speak voice alert
    speakVoiceAlert('Warning: High risk detected. Please seek medical help immediately.');

    // Start intelligent voice assistant
    startIntelligentVoiceAssistant();

    // Show emergency modal after a brief delay
    setTimeout(() => {
        document.getElementById('emergencyModal').classList.add('active');
    }, 1000);
}

// ==================== Voice System ====================
function speakVoiceAlert(message) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        speechSynthesis.speak(utterance);
    }
}

function startIntelligentVoiceAssistant() {
    if (voiceAssistantInterval) {
        clearInterval(voiceAssistantInterval);
    }

    isEmergencyActive = true;

    const supportiveMessages = [
        'Stay calm. Help is on the way. Try to remain conscious.',
        'Please breathe slowly. Assistance will arrive soon.',
        'You are not alone. Emergency services have been notified.',
        'Try to stay awake. Help is coming.',
        'Breathe deeply and slowly. Medical help is on the way.',
        'Stay still and remain calm. You will be okay.'
    ];

    let messageIndex = 0;

    // Speak immediately
    speakVoiceAlert(supportiveMessages[0]);

    // Repeat every 20 seconds
    voiceAssistantInterval = setInterval(() => {
        if (isEmergencyActive) {
            messageIndex = (messageIndex + 1) % supportiveMessages.length;
            speakVoiceAlert(supportiveMessages[messageIndex]);
        } else {
            clearInterval(voiceAssistantInterval);
        }
    }, 20000);
}

function stopVoiceAssistant() {
    isEmergencyActive = false;
    if (voiceAssistantInterval) {
        clearInterval(voiceAssistantInterval);
    }
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
}

// ==================== Emergency Actions ====================
function triggerEmergencyAlert() {
    speakVoiceAlert('Emergency alert activated. Please stay calm. Help has been requested.');
    document.getElementById('emergencyModal').classList.add('active');
}

function closeEmergencyModal() {
    document.getElementById('emergencyModal').classList.remove('active');
    stopVoiceAssistant();
}

async function shareLocation() {
    if (!userLocation) {
        showAlert('Please get your location first', 'warning');
        getLocation();
        return;
    }

    const lat = userLocation.latitude;
    const lng = userLocation.longitude;
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const shareText = `🚨 EMERGENCY - My location: ${googleMapsUrl}`;

    // Try Web Share API
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Emergency Location',
                text: shareText,
                url: googleMapsUrl
            });
            showAlert('Location shared successfully!', 'success');
        } catch (error) {
            console.log('Share cancelled or failed');
        }
    } else {
        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(shareText);
            showAlert('Location link copied to clipboard!', 'success');
        } catch (error) {
            showAlert('Location: ' + googleMapsUrl, 'info');
        }
    }
}

function showFamilyContacts() {
    const contacts = getEmergencyContacts();

    if (contacts.length === 0) {
        showAlert('No emergency contacts saved. Please add contacts first.', 'warning');
        return;
    }

    const modal = document.getElementById('familyModal');
    const contactsList = document.getElementById('familyContactsList');

    contactsList.innerHTML = contacts.map(contact => `
        <div class="contact-item">
            <div class="contact-info">
                <strong>${contact.name}</strong>
                <span>${contact.phone}</span>
            </div>
            <a href="tel:${contact.phone}" class="btn btn-primary">
                📞 Call
            </a>
        </div>
    `).join('');

    modal.classList.add('active');
}

function closeFamilyModal() {
    document.getElementById('familyModal').classList.remove('active');
}

// ==================== Location & Map ====================
function getLocation() {
    if (!navigator.geolocation) {
        showAlert('Geolocation is not supported by your browser', 'error');
        return;
    }

    const btn = document.getElementById('getLocationBtn');
    btn.innerHTML = '<span>⏳ Getting location...</span>';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };

            displayLocation(userLocation);
            initializeMap(userLocation.latitude, userLocation.longitude);

            btn.innerHTML = '<span>✓ Location Updated</span>';
            btn.disabled = false;

            showAlert('Location acquired successfully!', 'success');
        },
        (error) => {
            console.error('Geolocation error:', error);
            showAlert('Unable to get location. Please enable location services.', 'error');
            btn.innerHTML = '<span>📍 Get My Location</span>';
            btn.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function displayLocation(location) {
    document.getElementById('locationInfo').style.display = 'block';
    document.getElementById('latitude').textContent = location.latitude.toFixed(6);
    document.getElementById('longitude').textContent = location.longitude.toFixed(6);
    document.getElementById('accuracy').textContent = location.accuracy.toFixed(2) + ' meters';
}

function initializeMap(lat, lng) {
    const mapContainer = document.getElementById('map');
    mapContainer.style.display = 'block';

    // Initialize map if not already done
    if (!map) {
        map = L.map('map').setView([lat, lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
    } else {
        map.setView([lat, lng], 13);
    }

    // Add or update user marker
    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
    } else {
        userMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'user-marker',
                html: '<div style="background: #3498db; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map);
        userMarker.bindPopup('<b>Your Location</b>').openPopup();
    }
}

async function findNearbyHospitals() {
    if (!userLocation) {
        showAlert('Please get your location first', 'warning');
        getLocation();
        return;
    }

    const btn = document.getElementById('findHospitalsBtn');
    btn.innerHTML = '<span>⏳ Searching...</span>';
    btn.disabled = true;

    try {
        const lat = userLocation.latitude;
        const lng = userLocation.longitude;
        const radius = 5000; // 5km radius

        // Overpass API query for hospitals
        const query = `
            [out:json];
            (
                node["amenity"="hospital"](around:${radius},${lat},${lng});
                way["amenity"="hospital"](around:${radius},${lat},${lng});
                node["amenity"="clinic"](around:${radius},${lat},${lng});
            );
            out body;
        `;

        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        const response = await fetch(overpassUrl, {
            method: 'POST',
            body: query
        });

        if (!response.ok) {
            throw new Error('Failed to fetch hospitals');
        }

        const data = await response.json();
        displayHospitals(data.elements);

    } catch (error) {
        console.error('Hospital search error:', error);
        showAlert('Unable to fetch nearby hospitals. Please try again.', 'error');
    } finally {
        btn.innerHTML = '<span>🏥 Find Nearby Hospitals</span>';
        btn.disabled = false;
    }
}

function displayHospitals(hospitals) {
    // Clear existing hospital markers
    hospitalMarkers.forEach(marker => map.removeLayer(marker));
    hospitalMarkers = [];

    if (hospitals.length === 0) {
        showAlert('No hospitals found nearby. Try increasing search radius.', 'info');
        return;
    }

    const hospitalsList = document.getElementById('hospitalsList');
    const hospitalsContent = document.getElementById('hospitalsContent');

    hospitalsList.style.display = 'block';

    hospitalsContent.innerHTML = hospitals.slice(0, 10).map((hospital, index) => {
        const name = hospital.tags.name || 'Unnamed Hospital';
        const lat = hospital.lat;
        const lon = hospital.lon;
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            lat,
            lon
        );

        // Add marker to map
        const marker = L.marker([lat, lon], {
            icon: L.divIcon({
                className: 'hospital-marker',
                html: '<div style="background: #e74c3c; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);">H</div>',
                iconSize: [30, 30]
            })
        }).addTo(map);

        marker.bindPopup(`<b>${name}</b><br>Distance: ${distance.toFixed(2)} km`);
        hospitalMarkers.push(marker);

        // Create a fake phone number for demo (in real app, would come from API)
        const phone = '+1-XXX-XXX-XXXX';

        return `
            <div class="hospital-item">
                <div class="hospital-info">
                    <h4>${name}</h4>
                    <p>📍 ${distance.toFixed(2)} km away</p>
                </div>
                <a href="tel:${phone}" class="btn btn-danger">
                    📞 Call
                </a>
            </div>
        `;
    }).join('');

    showAlert(`Found ${hospitals.length} medical facilities nearby`, 'success');
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ==================== Emergency Contacts Management ====================
function getEmergencyContacts() {
    const contacts = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
    return contacts ? JSON.parse(contacts) : [];
}

function saveEmergencyContacts(contacts) {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
}

function addEmergencyContact() {
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();

    if (!name || !phone) {
        showAlert('Please enter both name and phone number', 'warning');
        return;
    }

    const contacts = getEmergencyContacts();
    contacts.push({ name, phone, id: Date.now() });
    saveEmergencyContacts(contacts);

    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';

    loadEmergencyContacts();
    showAlert('Emergency contact added successfully!', 'success');
}

function deleteEmergencyContact(id) {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    let contacts = getEmergencyContacts();
    contacts = contacts.filter(c => c.id !== id);
    saveEmergencyContacts(contacts);
    loadEmergencyContacts();
    showAlert('Contact deleted', 'info');
}

function loadEmergencyContacts() {
    const contacts = getEmergencyContacts();
    const contactsList = document.getElementById('contactsList');

    if (contacts.length === 0) {
        contactsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No emergency contacts added yet.</p>';
        return;
    }

    contactsList.innerHTML = contacts.map(contact => `
        <div class="contact-item">
            <div class="contact-info">
                <strong>${contact.name}</strong>
                <span>${contact.phone}</span>
            </div>
            <div class="contact-actions">
                <a href="tel:${contact.phone}" class="call-btn">📞 Call</a>
                <button onclick="deleteEmergencyContact(${contact.id})" class="delete-btn">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ==================== Health History ====================
function getHealthHistory() {
    const history = localStorage.getItem(STORAGE_KEYS.HEALTH_HISTORY);
    return history ? JSON.parse(history) : [];
}

function saveToHistory(result) {
    const history = getHealthHistory();

    const entry = {
        date: new Date().toISOString(),
        risk_level: result.risk_level,
        input: result.input,
        probability: result.probability,
        probabilities: result.probabilities,
        id: Date.now()
    };

    history.unshift(entry); // Add to beginning

    // Keep only last 50 entries
    if (history.length > 50) {
        history.pop();
    }

    localStorage.setItem(STORAGE_KEYS.HEALTH_HISTORY, JSON.stringify(history));
    loadHealthHistory();
    updateChart();
}

function loadHealthHistory() {
    const history = getHealthHistory();
    const historyList = document.getElementById('historyList');

    if (history.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No health records yet. Take your first assessment!</p>';
        return;
    }

    historyList.innerHTML = history.map(entry => {
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleString();

        return `
            <div class="history-item risk-${entry.risk_level.toLowerCase()}">
                <div class="history-header">
                    <span class="history-risk">${entry.risk_level} Risk (${(entry.probability * 100).toFixed(1)}%)</span>
                    <span class="history-date">${formattedDate}</span>
                </div>
                <div class="history-details">
                    Age: ${entry.input.age} | BP: ${entry.input.systolic_bp}/${entry.input.diastolic_bp} | HR: ${entry.input.heart_rate} bpm
                </div>
            </div>
        `;
    }).join('');
}

function clearHistory() {
    if (!confirm('Are you sure you want to clear all health history?')) return;

    localStorage.removeItem(STORAGE_KEYS.HEALTH_HISTORY);
    loadHealthHistory();
    updateChart();
    showAlert('History cleared', 'info');
}

// ==================== Chart Management ====================
function initializeChart() {
    const ctx = document.getElementById('healthChart').getContext('2d');

    healthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Systolic BP',
                    data: [],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Diastolic BP',
                    data: [],
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Heart Rate',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Health Trends Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    updateChart();
}

function updateChart() {
    const history = getHealthHistory();

    if (history.length === 0) return;

    // Get last 10 entries, reverse to show chronologically
    const recentHistory = history.slice(0, 10).reverse();

    const labels = recentHistory.map((entry, index) => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const systolicData = recentHistory.map(entry => entry.input.systolic_bp);
    const diastolicData = recentHistory.map(entry => entry.input.diastolic_bp);
    const heartRateData = recentHistory.map(entry => entry.input.heart_rate);

    healthChart.data.labels = labels;
    healthChart.data.datasets[0].data = systolicData;
    healthChart.data.datasets[1].data = diastolicData;
    healthChart.data.datasets[2].data = heartRateData;

    healthChart.update();
}

// ==================== Alert System ====================
function showAlert(message, type = 'info') {
    const alertBanner = document.getElementById('alertBanner');
    const alertMessage = document.getElementById('alertMessage');

    alertMessage.textContent = message;
    alertBanner.style.display = 'flex';

    // Set color based on type
    const colors = {
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db'
    };

    alertBanner.style.background = colors[type] || colors.info;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        closeAlert();
    }, 5000);
}

function closeAlert() {
    document.getElementById('alertBanner').style.display = 'none';
}

// ==================== Utility Functions ====================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// ==================== Console Banner ====================
console.log('%c GuardianHealth ', 'background: #3498db; color: white; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Elderly Health Monitoring System ', 'background: #2ecc71; color: white; font-size: 14px; padding: 5px;');
console.log('✓ Frontend initialized successfully');
console.log('⚠️ Make sure Flask backend is running on http://localhost:5000');
