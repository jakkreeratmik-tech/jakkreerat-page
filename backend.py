"""
ระบบเช็คอินผ่านโลเคชั่น - Backend API
Location-Based Check-in System - Flask Backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)

# ข้อมูล
CHECKINS_FILE = 'checkins.json'
LOCATIONS_FILE = 'locations.json'

# ข้อมูลสถานที่เริ่มต้น
DEFAULT_LOCATIONS = [
    {
        "id": 1,
        "name": "โครงการสถาบันเทคโนโลยี",
        "latitude": 13.7245,
        "longitude": 100.5384,
        "description": "สถาบันเทคโนโลยีแห่งประเทศไทย",
        "radius": 100
    },
    {
        "id": 2,
        "name": "ศูนย์ประชุมสิรินธร",
        "latitude": 13.6927,
        "longitude": 100.7522,
        "description": "ศูนย์ประชุมสิรินธรในพระราชูป",
        "radius": 100
    },
    {
        "id": 3,
        "name": "ห้องสมุดแห่งชาติ",
        "latitude": 13.7367,
        "longitude": 100.5648,
        "description": "ห้องสมุดแห่งชาติ กรุงเทพมหานคร",
        "radius": 100
    },
    {
        "id": 4,
        "name": "ศูนย์การค้า CentralWorld",
        "latitude": 13.7463,
        "longitude": 100.5382,
        "description": "ศูนย์การค้าคูณเหลี่ยมแห่งกรุงเทพ",
        "radius": 100
    },
    {
        "id": 5,
        "name": "สวนลุมพินี",
        "latitude": 13.7307,
        "longitude": 100.5549,
        "description": "สวนสาธารณะสวนลุมพินี",
        "radius": 100
    }
]

def load_checkins():
    """โหลดข้อมูลเช็คอินจากไฟล์"""
    if os.path.exists(CHECKINS_FILE):
        try:
            with open(CHECKINS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_checkins(checkins):
    """บันทึกข้อมูลเช็คอินลงไฟล์"""
    with open(CHECKINS_FILE, 'w', encoding='utf-8') as f:
        json.dump(checkins, f, ensure_ascii=False, indent=2)

def load_locations():
    """โหลดข้อมูลสถานที่จากไฟล์"""
    if os.path.exists(LOCATIONS_FILE):
        try:
            with open(LOCATIONS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            save_locations(DEFAULT_LOCATIONS)
            return DEFAULT_LOCATIONS
    else:
        save_locations(DEFAULT_LOCATIONS)
        return DEFAULT_LOCATIONS

def save_locations(locations):
    """บันทึกข้อมูลสถานที่ลงไฟล์"""
    with open(LOCATIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(locations, f, ensure_ascii=False, indent=2)

def calculate_distance(lat1, lon1, lat2, lon2):
    """คำนวณระยะห่างระหว่างจุดสองจุด (Haversine formula)"""
    import math
    R = 6371000  # รัศมีโลกเป็นเมตร
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat/2) * math.sin(dlat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon/2) * math.sin(dlon/2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

# ===================== Routes =====================

@app.route('/api/locations', methods=['GET'])
def get_locations():
    """ดึงข้อมูลสถานที่ทั้งหมด"""
    locations = load_locations()
    return jsonify({
        'success': True,
        'data': locations
    })

@app.route('/api/locations', methods=['POST'])
def add_location():
    """เพิ่มสถานที่ใหม่"""
    data = request.json
    locations = load_locations()
    
    new_location = {
        'id': max([loc['id'] for loc in locations] or [0]) + 1,
        'name': data.get('name'),
        'latitude': data.get('latitude'),
        'longitude': data.get('longitude'),
        'description': data.get('description'),
        'radius': data.get('radius', 100)
    }
    
    locations.append(new_location)
    save_locations(locations)
    
    return jsonify({
        'success': True,
        'message': 'เพิ่มสถานที่สำเร็จ',
        'data': new_location
    }), 201

@app.route('/api/checkin', methods=['POST'])
def perform_checkin():
    """ทำการเช็คอิน"""
    data = request.json
    user_lat = data.get('latitude')
    user_lon = data.get('longitude')
    location_id = data.get('location_id')
    
    locations = load_locations()
    location = next((loc for loc in locations if loc['id'] == location_id), None)
    
    if not location:
        return jsonify({
            'success': False,
            'message': 'ไม่พบสถานที่'
        }), 404
    
    # คำนวณระยะห่าง
    distance = calculate_distance(
        user_lat, user_lon,
        location['latitude'], location['longitude']
    )
    
    # ตรวจสอบว่าอยู่ในพื้นที่หรือไม่
    if distance > location['radius']:
        return jsonify({
            'success': False,
            'message': f'คุณห่างไกลจากสถานที่ {distance:.0f} เมตร (ขีดจำกัด: {location["radius"]}m)',
            'distance': distance
        }), 403
    
    # บันทึกเช็คอิน
    checkins = load_checkins()
    checkin_record = {
        'id': len(checkins) + 1,
        'location_id': location_id,
        'location_name': location['name'],
        'user_latitude': user_lat,
        'user_longitude': user_lon,
        'distance': distance,
        'timestamp': datetime.now().isoformat(),
        'device_info': data.get('device_info', 'Unknown')
    }
    
    checkins.append(checkin_record)
    save_checkins(checkins)
    
    return jsonify({
        'success': True,
        'message': f'เช็คอินสำเร็จที่ {location["name"]}',
        'data': checkin_record
    }), 200

@app.route('/api/checkins', methods=['GET'])
def get_checkins():
    """ดึงข้อมูลเช็คอินทั้งหมด"""
    checkins = load_checkins()
    limit = request.args.get('limit', default=100, type=int)
    
    return jsonify({
        'success': True,
        'total': len(checkins),
        'data': checkins[-limit:]
    })

@app.route('/api/checkins/<int:location_id>', methods=['GET'])
def get_checkins_by_location(location_id):
    """ดึงข้อมูลเช็คอินตามสถานที่"""
    checkins = load_checkins()
    location_checkins = [c for c in checkins if c['location_id'] == location_id]
    
    return jsonify({
        'success': True,
        'location_id': location_id,
        'total': len(location_checkins),
        'data': location_checkins
    })

@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """ดึงสถิติเช็คอิน"""
    from collections import Counter
    from datetime import timedelta
    
    checkins = load_checkins()
    now = datetime.now()
    today = now.date().isoformat()
    week_ago = (now - timedelta(days=7)).date().isoformat()
    
    # เช็คอินวันนี้
    today_checkins = [c for c in checkins 
                      if c['timestamp'][:10] == today]
    
    # เช็คอินสัปดาห์นี้
    week_checkins = [c for c in checkins 
                     if c['timestamp'][:10] >= week_ago]
    
    # สถานที่ที่เข้าชุมชนมากที่สุด
    location_counts = Counter(c['location_name'] for c in checkins)
    most_visited = location_counts.most_common(1)[0] if location_counts else None
    
    return jsonify({
        'success': True,
        'total_checkins': len(checkins),
        'today_checkins': len(today_checkins),
        'week_checkins': len(week_checkins),
        'most_visited_location': most_visited[0] if most_visited else None,
        'most_visited_count': most_visited[1] if most_visited else 0
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """ตรวจสอบสถานะเซิร์ฟเวอร์"""
    return jsonify({
        'success': True,
        'status': 'running',
        'timestamp': datetime.now().isoformat()
    })

# ===================== Error Handling =====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'ไม่พบ API endpoint นี้'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
    }), 500

# ===================== Main =====================

if __name__ == '__main__':
    print("🚀 Starting Location Check-in System Backend...")
    print("📍 Server running on http://localhost:5000")
    print("📚 API Documentation available at http://localhost:5000/api/health")
    
    # โหลดข้อมูลเริ่มต้น
    load_locations()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
