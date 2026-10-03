import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Keyboard from "./pages/Keyboard";
import Functions from "./pages/Functions";
import Settings from "./pages/Settings";

import "./styles/app.css";

function App() {
  const [page, setPage] =
    useState("dashboard");

  const [layoutText, setLayoutText] =
    useState(null);

  const [keymapText, setKeymapText] =
    useState(null);

  const [layoutFileName, setLayoutFileName] =
    useState(null);

  const [keymapFileName, setKeymapFileName] =
    useState(null);

  /*
   * This is temporary frontend state.
   *
   * Later this will come from the Rust backend
   * configuration.
   */
  const [config] = useState({
    functions: {
      test_button_1: {
        type: "print",
        message: "Button 1 works!",
      },

      test_button_2: {
        type: "open_url",
        url: "https://example.com",
      },

      test_button_3: {
        type: "print",
        message: "Button 3 works!",
      },
    },

    buttons: {
      1: "test_button_1",
      2: "test_button_2",
      3: "test_button_3",
    },
  });

  function handleLayoutLoaded(
    text,
    filename
  ) {
    setLayoutText(text);
    setLayoutFileName(filename);
  }

  function handleKeymapLoaded(
    text,
    filename
  ) {
    setKeymapText(text);
    setKeymapFileName(filename);
  }

  function renderPage() {
    switch (page) {
      case "keyboard":
        return (
          <Keyboard
            layoutText={layoutText}
            keymapText={keymapText}
            config={config}
          />
        );

      case "functions":
        return <Functions />;

      case "settings":
        return (
          <Settings
            layoutFileName={
              layoutFileName
            }
            keymapFileName={
              keymapFileName
            }
            onLayoutLoaded={
              handleLayoutLoaded
            }
            onKeymapLoaded={
              handleKeymapLoaded
            }
          />
        );

      default:
        return (
          <Dashboard
            config={config}
          />
        );
    }
  }

  return (
    <div className="app">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
      />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
