from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from smartcard.System import readers
from smartcard.util import toHexString, toBytes

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('reader_connected')
def handle_reader_connected():
    print("Client connected to reader. Ready for commands.")

@socketio.on('read_card')
def handle_read_card():
    # Example: Send DESFire SELECT_APPLICATION APDU (adjust as needed)
    apdu = "00A4040000"  # Replace with actual DESFire APDU
    emit('apdu_command', apdu, callback=process_apdu_response)

def process_apdu_response(response):
    if response['success']:
        data = response['data']
        print(f"Received APDU response: {data}")
        # Process DESFire data here (e.g., parse card UID)
    else:
        print(f"APDU error: {response['error']}")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, ssl_context='adhoc')  # HTTPS required for WebUSB