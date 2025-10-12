import React, { useState, useEffect } from "react";

function App() {
  const [sensorData, setSensorData] = useState({
    ultrasonico: null,
    laser: null,
  });
  const [lcdLine1, setLcdLine1] = useState("");
  const [lcdLine2, setLcdLine2] = useState("");
  const [ledStatus, setLedStatus] = useState("off");
  const [isApiConnected, setIsApiConnected] = useState(false);

  const API_BASE_URL = "https://topologic-quarrelingly-terri.ngrok-free.app";

  const fetchSensorData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sensors`, {
        method: "GET",
        headers: { "ngrok-skip-browser-warning": "true" },
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = await response.json();
        setSensorData(data);
        setIsApiConnected(true);
      } else {
        setIsApiConnected(false);
      }
    } catch (error) {
      console.error("Error trayendo datos de sensores:", error);
      setIsApiConnected(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleLedControl = async (state) => {
    try {
      const response = await fetch(`${API_BASE_URL}/led/${state}`, {
        method: "GET",
        headers: { "ngrok-skip-browser-warning": "true" },
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        setLedStatus(state);
      }
    } catch (error) {
      console.error(`Error encendiendo LED ${state}:`, error);
    }
  };

  const handleLcdSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/lcd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line1: lcdLine1, line2: lcdLine2 }),
      });
    } catch (error) {
      console.error("Error escribiendo en LCD:", error);
    }
  };

  const sanitizeText = (text) => {
    let sanitized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    sanitized = sanitized.replace(
      /[^a-zA-Z0-9 \.,\?!@#\$%\^&\*\(\)_\+\-=\[\]\{\};:'"\\\|`~<>]/g,
      ""
    );
    return sanitized;
  };

  const handleLine1Change = (e) => {
    setLcdLine1(sanitizeText(e.target.value));
  };

  const handleLine2Change = (e) => {
    setLcdLine2(sanitizeText(e.target.value));
  };

  return (
    <div className="app-container">
      <header>
        <h1>Panel de Control de Dispositivos</h1>
        <p className="subtitle">Raspberry Pi + Arduino</p>
      </header>

      <div className="status-panel">
        <div className="status-row">
          <span className="status-label">Estado conexión: </span>
          <span className={isApiConnected ? "connected" : "disconnected"}>
            {isApiConnected ? "CONECTADO" : "DESCONECTADO"}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Sensor Ultrasonico HC-SR04:</span>
          <span className="distance-value">
            {sensorData.ultrasonico ?? "---"} cm
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Sensor Laser vl53l0x:</span>
          <span className="distance-value">{sensorData.laser ?? "---"} mm</span>
        </div>
      </div>

      <div className="controls-grid">
        <div className="control-card">
          <h2>Control de LED</h2>
          <p>
            Estado:{" "}
            <span className={ledStatus === "on" ? "connected" : "disconnected"}>
              {ledStatus.toUpperCase()}
            </span>
          </p>
          <div className="button-group">
            <button
              onClick={() => handleLedControl("on")}
              disabled={!isApiConnected}
            >
              Encender
            </button>
            <button
              onClick={() => handleLedControl("off")}
              disabled={!isApiConnected}
            >
              Apagar
            </button>
          </div>
        </div>

        <div className="control-card">
          <h2>Control de Pantalla LCD</h2>
          <form className="lcd-form" onSubmit={handleLcdSubmit}>
            <input
              type="text"
              value={lcdLine1}
              onChange={handleLine1Change}
              placeholder="Linea 1"
              maxLength="16"
              disabled={!isApiConnected}
            />
            <input
              type="text"
              value={lcdLine2}
              onChange={handleLine2Change}
              placeholder="Linea 2"
              maxLength="16"
              disabled={!isApiConnected}
            />
            <button type="submit" disabled={!isApiConnected}>
              Enviar a LCD
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
