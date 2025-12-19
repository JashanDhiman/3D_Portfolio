function ToastContainer({ toasts }) {
 return (
  <div style={containerStyle}>
   {toasts.map((toast) => (
    <div
     key={toast.id}
     style={{
      ...toastStyle,
      ...typeStyles[toast.type],
     }}
    >
     {toast.message}
    </div>
   ))}
  </div>
 );
}

const containerStyle = {
 position: "fixed",
 top: 20,
 right: 20,
 display: "flex",
 flexDirection: "column",
 gap: "10px",
 zIndex: 9999,
};

const toastStyle = {
 padding: "12px 16px",
 borderRadius: "6px",
 color: "#fff",
 fontSize: "14px",
 minWidth: "200px",
 boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
};

const typeStyles = {
 success: { backgroundColor: "#16a34a" },
 error: { backgroundColor: "#dc2626" },
 info: { backgroundColor: "#2563eb" },
};

export default ToastContainer;
