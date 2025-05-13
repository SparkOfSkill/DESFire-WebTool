let device;
const socket = io('http://localhost:5000'); // Replace with your server URL

async function connectReader() {
    try {
        // Request USB device access (Omnikey HDI filters)
        device = await navigator.usb.requestDevice({
            filters: [{ vendorId: 0x076B }] // Omnikey vendor ID
        });
        await device.open();
        await device.selectConfiguration(1);
        await device.claimInterface(0);
        document.getElementById('status').textContent = 'Reader connected!';
        socket.emit('reader_connected');
    } catch (error) {
        console.error('Error connecting to reader:', error);
    }
}

// Listen for APDU commands from the server
socket.on('apdu_command', async (command, callback) => {
    try {
        // Send APDU to the reader
        const result = await device.transferOut(1, hexToBuffer(command));
        const response = await device.transferIn(1, 64); // Adjust endpoint/len as needed
        const data = bufferToHex(response.data.buffer);
        callback({ success: true, data });
    } catch (error) {
        callback({ success: false, error: error.message });
    }
});

// Helper functions
function hexToBuffer(hex) {
    return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))).buffer;
}

function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}