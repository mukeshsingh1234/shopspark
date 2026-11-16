export const CATEGORIES = [
  { name: "Electronics", icon: "📱" },
  { name: "Fashion", icon: "👗" },
  { name: "Home & Kitchen", icon: "🏠" },
  { name: "Beauty", icon: "💄" },
  { name: "Books", icon: "📚" },
  { name: "Sports", icon: "⚽" },
  { name: "Toys", icon: "🧸" },
  { name: "Grocery", icon: "🛒" },
  { name: "Other", icon: "📦" },
];

export const FREE_DELIVERY_ABOVE = 499;
export const DELIVERY_FEE = 40;

export const formatPrice = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export const discountPercent = (price, mrp) =>
  mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const formatDate = (ts) => {
  const d = ts && typeof ts.toDate === "function" ? ts.toDate() : null;
  return d
    ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";
};

export const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#eef1f4"/><text x="50%" y="50%" fill="#9aa5b1" font-family="Arial" font-size="22" text-anchor="middle" dominant-baseline="middle">No image</text></svg>'
  );

// Shrinks a photo so it is small enough to store directly in Firestore
export function compressImage(file, maxSize = 600, quality = 0.65) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image"));
    };
    img.src = url;
  });
}