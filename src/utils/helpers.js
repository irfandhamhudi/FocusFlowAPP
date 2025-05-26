/**
 * Mengembalikan inisial dan warna acak berdasarkan username.
 * @param {string} username - Nama pengguna untuk menghasilkan inisial dan warna.
 * @returns {Object} - Objek dengan properti `initials` dan `color`.
 */
export const getInitialsAndColor = (username) => {
  if (!username) return { initials: "??", color: "#ccc" };
  const nameParts = username.split(" ");
  const initials =
    nameParts.length > 1
      ? nameParts[0][0] + nameParts[1][0]
      : nameParts[0].slice(0, 2);
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 50%)`;
  return { initials: initials.toUpperCase(), color };
};

/**
 * Mengembalikan tipe file berdasarkan ekstensi nama file.
 * @param {string} fileName - Nama file untuk menentukan tipe.
 * @returns {string} - Tipe file ("PDF", "Image", atau "Document").
 */
export const getFileType = (fileName) => {
  if (fileName.toLowerCase().endsWith(".pdf")) return "PDF";
  if (
    fileName.toLowerCase().endsWith(".jpg") ||
    fileName.toLowerCase().endsWith(".jpeg") ||
    fileName.toLowerCase().endsWith(".png")
  )
    return "Image";
  return "Document";
};

/**
 * Memformat tanggal ke format lokal Indonesia dengan zona waktu Asia/Jakarta.
 * @param {string} dateString - String tanggal dalam format ISO atau sejenisnya.
 * @returns {string} - Tanggal yang diformat (contoh: "19 Mei 2025 00:45 WIB").
 */
export const formatDate = (dateString) => {
  if (!dateString) return "Tidak ditentukan";
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
};

/**
 * Mengembalikan inisial dari username (versi sederhana untuk kompatibilitas).
 * @param {string} username - Nama pengguna untuk menghasilkan inisial.
 * @returns {string} - Inisial (maksimal 2 karakter).
 */
export const getInitial = (username) => {
  return username && username.length > 0
    ? username[0].toUpperCase() + (username[1] ? username[1].toUpperCase() : "")
    : "?";
};

/**
 * Mengembalikan warna avatar berdasarkan indeks.
 * @param {number} index - Indeks untuk memilih warna dari daftar.
 * @returns {string} - Kelas CSS untuk warna avatar.
 */
export const getAvatarColor = (index) => {
  const avatarColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-pink-500",
  ];
  return avatarColors[index % avatarColors.length];
};

/**
 * Menghitung total komentar termasuk balasan.
 * @param {Object} task - Objek tugas dengan properti comments.
 * @returns {number} - Total komentar dan balasan.
 */
export const getTotalComments = (task) => {
  if (!task.comments || task.comments.length === 0) return 0;
  const commentCount = task.comments.length;
  const replyCount = task.comments.reduce((total, comment) => {
    return total + (comment.replies ? comment.replies.length : 0);
  }, 0);
  return commentCount + replyCount;
};

/**
 * Menghitung total lampiran dalam tugas.
 * @param {Object} task - Objek tugas dengan properti attachment.
 * @returns {number} - Total lampiran.
 */
export const getTotalAttachments = (task) => {
  return task.attachment && Array.isArray(task.attachment)
    ? task.attachment.length
    : 0;
};
