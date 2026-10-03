import { useEffect, useState } from "react";
import { getConfig } from "../api/tauri";

function Dashboard() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    getConfig()
      .then(setConfig)
      .catch(console.error);
  }, []);

  const buttonCount = config
    ? Object.keys(config.buttons || {}).length
    : 0;

  const functionCount = config
    ? Object.keys(config.functions || {}).length
    : 0;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h2>Dashboard</h2>
          <p>
            Manage your ZMK keyboard and its actions.
          </p>
        </div>

        <div className="connection-status">
          <span />
          Connected
        </div>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span>Keyboard</span>
          <strong>Connected</strong>
          <small>ZMK HID interface</small>
        </div>

        <div className="stat-card">
          <span>Mappings</span>
          <strong>{buttonCount}</strong>
          <small>Configured buttons</small>
        </div>

        <div className="stat-card">
          <span>Functions</span>
          <strong>{functionCount}</strong>
          <small>Available actions</small>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Button mappings</h3>
            <p>
              Functions currently assigned to your keyboard.
            </p>
          </div>
        </div>

        {config && (
          <div className="mapping-list">
            {Object.entries(config.buttons).map(
              ([button, functionName]) => (
                <div
                  className="mapping"
                  key={button}
                >
                  <div className="button-number">
                    {button}
                  </div>

                  <div className="mapping-info">
                    <strong>
                      Button {button}
                    </strong>

                    <span>
                      {functionName}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
