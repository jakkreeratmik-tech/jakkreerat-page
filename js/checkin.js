// =========================================
// ระบบเช็คอินผ่านโลเคชั่น
// Location-Based Check-in System
// =========================================

// ข้อมูลสถานที่
const locations = [
    {
        id: 1,
        name: "โครงการสถาบันเทคโนโลยี",
        latitude: 13.7245,
        longitude: 100.5384,
        description: "สถาบันเทคโนโลยีแห่งประเทศไทย",
        icon: "🏛️"
    },
    {
        id: 2,
        name: "ศูนย์ประชุมสิรินธร",
        latitude: 13.6927,
        longitude: 100.7522,
        description: "ศูนย์ประชุมสิรินธรในพระราชูป",
        icon: "🏢"
    },
    {
        id: 3,
        name: "ห้องสมุดแห่งชาติ",
        latitude: 13.7367,
        longitude: 100.5648,
        description: "ห้องสมุดแห่งชาติ กรุงเทพมหานคร",
        icon: "📚"
    },
    {
        id: 4,
        name: "ศูนย์การค้า CentralWorld",
        latitude: 13.7463,
        longitude: 100.5382,
        description: "ศูนย์การค้าคูณเหลี่ยมแห่งกรุงเทพ",
        icon: "🛍️"
    },
    {
        id: 5,
        name: "สวนลุมพินี",
        latitude: 13.7307,
        longitude: 100.5549,
        description: "สวนสาธารณะสวนลุมพินี",
        icon: "🌳"
    }
];

// ตัวแปรสถานะ
let currentPosition = null;
let checkinHistory = JSON.parse(localStorage.getItem('checkinHistory')) || [];
let autoRefreshInterval = null;

// Elements
const getLocationBtn = document.getElementById('getLocationBtn');
const refreshLocationBtn = document.getElementById('refreshLocationBtn');
const locationDisplay = document.getElementById('locationDisplay');
const accuracyDisplay = document.getElementById('accuracyDisplay');
const locationsList = document.getElementById('locationsList');
const checkinMessage = document.getElementById('checkinMessage');
const checkinHistory_el = document.getElementById('checkinHistory');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const radiusInput = document.getElementById('radiusInput');
const soundToggle = document.getElementById('soundToggle');
const notificationToggle = document.getElementById('notificationToggle');
const autoRefreshToggle = document.getElementById('autoRefreshToggle');

// Event Listeners
getLocationBtn.addEventListener('click', getLocation);
refreshLocationBtn.addEventListener('click', getLocation);
clearHistoryBtn.addEventListener('click', clearHistory);
radiusInput.addEventListener('change', () => {
    getLocation();
    localStorage.setItem('detectionRadius', radiusInput.value);
});
autoRefreshToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        startAutoRefresh();
    } else {
        stopAutoRefresh();
    }
});

// ===================== ฟังก์ชันหลัก =====================

// ดึงตำแหน่งปัจจุบัน
function getLocation() {
    getLocationBtn.disabled = true;
    getLocationBtn.textContent = '⏳ กำลังดึงข้อมูล...';

    if (!navigator.geolocation) {
        showMessage('❌ เบราว์เซอร์ของคุณไม่รองรับ Geolocation', 'error');
        getLocationBtn.disabled = false;
        getLocationBtn.textContent = '🔍 ดึงข้อมูลตำแหน่ง';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentPosition = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().getTime()
            };

            displayPosition();
            checkNearbyLocations();
            saveLocationToHistory();

            if (autoRefreshToggle.checked) {
                startAutoRefresh();
            }

            getLocationBtn.disabled = false;
            getLocationBtn.textContent = '🔍 ดึงข้อมูลตำแหน่ง';
        },
        (error) => {
            let errorMsg = '';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = '❌ คุณปฏิเสธการเข้าถึงตำแหน่ง กรุณาอนุญาตในการตั้งค่าเบราว์เซอร์';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = '❌ ไม่สามารถดึงข้อมูลตำแหน่งได้';
                    break;
                case error.TIMEOUT:
                    errorMsg = '⏱️ หมดเวลาในการดึงข้อมูลตำแหน่ง';
                    break;
                default:
                    errorMsg = '❌ เกิดข้อผิดพลาด: ' + error.message;
            }
            showMessage(errorMsg, 'error');
            getLocationBtn.disabled = false;
            getLocationBtn.textContent = '🔍 ดึงข้อมูลตำแหน่ง';
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// แสดงตำแหน่งปัจจุบัน
function displayPosition() {
    if (!currentPosition) return;

    const { latitude, longitude, accuracy } = currentPosition;
    locationDisplay.textContent = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    accuracyDisplay.textContent = `ความแม่นยำ: ±${accuracy.toFixed(0)} เมตร`;
}

// ตรวจสอบสถานที่ที่อยู่ใกล้เคียง
function checkNearbyLocations() {
    if (!currentPosition) return;

    const radius = parseInt(radiusInput.value);
    locationsList.innerHTML = '';

    locations.forEach(location => {
        const distance = calculateDistance(
            currentPosition.latitude,
            currentPosition.longitude,
            location.latitude,
            location.longitude
        );

        const isNearby = distance <= radius;
        const locationHTML = createLocationCard(location, distance, isNearby, radius);
        locationsList.innerHTML += locationHTML;

        // Event listener สำหรับปุ่มเช็คอิน
        const checkinBtn = locationsList.querySelector(`#checkin-${location.id}`);
        if (checkinBtn) {
            checkinBtn.addEventListener('click', () => {
                performCheckin(location, distance);
            });
        }
    });
}

// สร้าง Location Card
function createLocationCard(location, distance, isNearby, radius) {
    const statusClass = isNearby ? 'nearby' : 'far';
    const statusText = isNearby ? '✅ อยู่ในพื้นที่' : '❌ ห่างไกล';
    const buttonText = isNearby ? '✓ เช็คอิน' : '🚫 ห่างไกลเกินไป';
    const buttonDisabled = !isNearby ? 'disabled' : '';

    return `
        <div class="location-item ${statusClass}">
            <div class="location-info">
                <div class="location-header">
                    <span class="location-icon">${location.icon}</span>
                    <h4>${location.name}</h4>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <p class="location-desc">${location.description}</p>
                <div class="distance-info">
                    <span class="distance">📏 ระยะห่าง: ${distance.toFixed(0)} เมตร</span>
                    <span class="radius-limit">(ขีดจำกัด: ${radius}m)</span>
                </div>
            </div>
            <button id="checkin-${location.id}" class="btn ${isNearby ? 'btn-success' : 'btn-disabled'}" ${buttonDisabled}>
                ${buttonText}
            </button>
        </div>
    `;
}

// ทำการเช็คอิน
function performCheckin(location, distance) {
    const checkinData = {
        id: Date.now(),
        locationId: location.id,
        locationName: location.name,
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        distance: distance,
        timestamp: new Date(),
        timeString: new Date().toLocaleString('th-TH')
    };

    checkinHistory.unshift(checkinData);
    localStorage.setItem('checkinHistory', JSON.stringify(checkinHistory));

    // แสดงข้อความสำเร็จ
    showMessage(
        `✅ เช็คอินสำเร็จ!\n${location.name}\n${checkinData.timeString}`,
        'success'
    );

    playSound('success');
    showNotification(location.name + ' - เช็คอินสำเร็จ');

    updateHistory();
    updateStatistics();
}

// ===================== ฟังก์ชันเสริม =====================

// คำนวณระยะห่าง (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // รัศมีโลกเป็นเมตร
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// แสดงข้อความ
function showMessage(message, type) {
    checkinMessage.className = `message-box message-${type}`;
    checkinMessage.textContent = message;
    checkinMessage.style.display = 'block';

    setTimeout(() => {
        checkinMessage.style.display = 'none';
    }, 5000);
}

// เสียง
function playSound(type) {
    if (!soundToggle.checked) return;

    // ใช้ Web Audio API สำหรับสร้างเสียง
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'success') {
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    } catch (e) {
        console.log('Audio not available');
    }
}

// การแจ้งเตือน
function showNotification(message) {
    if (!notificationToggle.checked || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
        new Notification('เช็คอินสำเร็จ', {
            body: message,
            icon: '📍'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('เช็คอินสำเร็จ', {
                    body: message,
                    icon: '📍'
                });
            }
        });
    }
}

// อัปเดตประวัติ
function updateHistory() {
    if (checkinHistory.length === 0) {
        checkinHistory_el.innerHTML = '<p style="text-align: center; color: #999;">ยังไม่มีประวัติ</p>';
        return;
    }

    checkinHistory_el.innerHTML = checkinHistory
        .slice(0, 10)
        .map((item, index) => `
            <div class="history-item">
                <div class="history-info">
                    <span class="history-index">#${index + 1}</span>
                    <div class="history-details">
                        <strong>${item.locationName}</strong>
                        <small>${item.timeString}</small>
                        <tiny>${item.distance.toFixed(0)}m</tiny>
                    </div>
                </div>
            </div>
        `)
        .join('');
}

// อัปเดตสถิติ
function updateStatistics() {
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayCheckins = checkinHistory.filter(item =>
        new Date(item.timestamp).toDateString() === today
    ).length;

    const weekCheckins = checkinHistory.filter(item =>
        new Date(item.timestamp) >= weekAgo
    ).length;

    // หาสถานที่ที่เข้าชุมชนมากที่สุด
    const locationCounts = {};
    checkinHistory.forEach(item => {
        locationCounts[item.locationName] = (locationCounts[item.locationName] || 0) + 1;
    });
    const mostVisited = Object.entries(locationCounts).length > 0
        ? Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0][0]
        : '-';

    document.getElementById('totalCheckins').textContent = checkinHistory.length;
    document.getElementById('weekCheckins').textContent = weekCheckins;
    document.getElementById('todayCheckins').textContent = todayCheckins;
    document.getElementById('mostVisited').textContent = mostVisited;
}

// ล้างประวัติ
function clearHistory() {
    if (confirm('คุณแน่ใจหรือไม่ที่จะล้างประวัติทั้งหมด?')) {
        checkinHistory = [];
        localStorage.removeItem('checkinHistory');
        updateHistory();
        updateStatistics();
        showMessage('✅ ประวัติถูกล้างแล้ว', 'success');
    }
}

// อัปเดตตำแหน่งอัตโนมัติ
function startAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(getLocation, 30000); // ทุก 30 วินาที
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// บันทึกตำแหน่งลงประวัติ
function saveLocationToHistory() {
    const locationLog = {
        timestamp: new Date(),
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        accuracy: currentPosition.accuracy
    };
    // เก็บไว้ใน sessionStorage เพื่อการวิเคราะห์
    const locationLogs = JSON.parse(sessionStorage.getItem('locationLogs')) || [];
    locationLogs.push(locationLog);
    sessionStorage.setItem('locationLogs', JSON.stringify(locationLogs.slice(-50)));
}

// ===================== เริ่มต้น =====================

// โหลดการตั้งค่าที่บันทึกไว้
function loadSettings() {
    const savedRadius = localStorage.getItem('detectionRadius');
    if (savedRadius) {
        radiusInput.value = savedRadius;
    }
}

// เริ่มต้นเมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateHistory();
    updateStatistics();

    // ขออนุญาตสำหรับการแจ้งเตือน
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});
