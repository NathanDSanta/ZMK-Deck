function Sidebar({ currentPage, onNavigate }) {
  const items = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      id: "keyboard",
      label: "Keyboard",
      icon: "⌨",
    },
    {
      id: "functions",
      label: "Functions",
      icon: "⚡",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">Z</div>

        <div>
          <h1>ZMK Deck</h1>
          <span>Keyboard control</span>
        </div>
      </div>

      <nav>
        {items.map((item) => (
          <button
            key={item.id}
            className={
              currentPage === item.id
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-status">
        <span className="status-dot" />
        <div>
          <strong>Listener active</strong>
          <small>Waiting for events</small>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
