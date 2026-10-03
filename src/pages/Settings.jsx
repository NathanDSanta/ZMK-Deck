function Settings({
  layoutFileName,
  keymapFileName,
  onLayoutLoaded,
  onKeymapLoaded,
}) {
  async function handleLayout(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();

    onLayoutLoaded(
      text,
      file.name
    );
  }

  async function handleKeymap(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();

    onKeymapLoaded(
      text,
      file.name
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            CONFIGURATION
          </p>

          <h2>Settings</h2>

          <p>
            Configure the keyboard files used
            by ZMK Deck.
          </p>
        </div>
      </header>

      <section className="settings-section">
        <div className="settings-header">
          <h3>Keyboard files</h3>

          <p>
            ZMK Deck uses the physical layout
            and keymap to construct the keyboard
            interface.
          </p>
        </div>

        <div className="file-setting">
          <div>
            <strong>
              Physical layout
            </strong>

            <span>
              {layoutFileName ??
                "No layout loaded"}
            </span>
          </div>

          <label className="file-button">
            Choose JSON

            <input
              type="file"
              accept=".json,application/json"
              onChange={handleLayout}
              hidden
            />
          </label>
        </div>

        <div className="file-setting">
          <div>
            <strong>
              ZMK keymap
            </strong>

            <span>
              {keymapFileName ??
                "No keymap loaded"}
            </span>
          </div>

          <label className="file-button">
            Choose keymap

            <input
              type="file"
              accept=".keymap,text/plain"
              onChange={handleKeymap}
              hidden
            />
          </label>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-header">
          <h3>Application</h3>

          <p>
            General ZMK Deck configuration.
          </p>
        </div>

        <div className="setting-row">
          <div>
            <strong>
              Configuration
            </strong>

            <span>
              Live configuration is managed
              by the Rust backend.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Settings;
