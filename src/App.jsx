import React, { useState, useEffect } from "react";
import "./App.css";

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
      console.error("Error error trayendo datos del sensor:", error);
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
      console.error(`Error encendiendo led ${state}:`, error);
    }
  };

  const handleToggleLed = () => {
    const newState = ledStatus === "on" ? "off" : "on";
    handleLedControl(newState);
  };

  const handleLcdSubmit = async (e) => {
    e.preventDefault();

    //Expresión regular para detectar fuera del rango ASCII básico
    const invalidCharRegex = /[^\x00-\x7F]/;

    if (invalidCharRegex.test(lcdLine1) || invalidCharRegex.test(lcdLine2)) {
      alert(
        "El texto contiene caracteres no permitidos (como tildes o 'ñ').\nUsa solo caracteres básicos"
      );
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/lcd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line1: lcdLine1, line2: lcdLine2 }),
      });
    } catch (error) {
      console.error("Error escribiendo en la LCD:", error);
    }
  };
  return (
    <div className="app-container">
      <header>
        <h1>Fase 3 - proyecto</h1>
        <p className="subtitle">Raspberry Pi + Arduino</p>
        <p className="subtitle">Jonathan Franco 1190-22-515</p>
        <p className="subtitle">Mánleo Chacón 1190-22-7368</p>
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
          <span className="distance-value">
            {sensorData.laser == null ? "---" : sensorData.laser / 10} cm
          </span>
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
            <button onClick={handleToggleLed} disabled={!isApiConnected}>
              {ledStatus === "on" ? "Apagar" : "Encender"}
            </button>
          </div>
        </div>

        <div className="control-card">
          <h2>Control de Pantalla LCD</h2>
          <form className="lcd-form" onSubmit={handleLcdSubmit}>
            <input
              type="text"
              value={lcdLine1}
              onChange={(e) => setLcdLine1(e.target.value)}
              placeholder="Linea 1"
              maxLength="16"
              disabled={!isApiConnected}
            />
            <input
              type="text"
              value={lcdLine2}
              onChange={(e) => setLcdLine2(e.target.value)}
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
