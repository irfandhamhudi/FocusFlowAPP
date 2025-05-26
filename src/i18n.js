// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Objek terjemahan untuk berbagai bahasa
const resources = {
  english: {
    translation: {
      settings: {
        title: "Settings",
        profile: "Profile",
        notification: "Notification",
        language: "Language",
        updatePicture: "Update Picture",
        fullName: "Full Name",
        emailAddress: "Email Address",
        role: "Role",
        department: "Department",
        security: "Security",
        password: "Password",
        changePassword: "Change My Password",
        twoFactorAuth: "Two Factor Authenticator",
        enable: "Enable",
        notificationSettings: "Notification Settings (in development)",
        emailNotifications: "Email Notifications",
        inAppNotifications: "In-App Notifications",
        taskUpdates: "Task Updates",
        mentions: "Mentions",
        saveChanges: "Save Changes",
        languageSettings: "Language Settings",
        chooseLanguage:
          "Choose your preferred language for the application interface.",
        english: "English",
        indonesian: "Bahasa Indonesia",
        spanish: "Español",
        changePasswordModal: {
          title: "Change Password",
          currentPassword: "Current Password",
          newPassword: "New Password",
          confirmNewPassword: "Confirm New Password",
          cancel: "Cancel",
          updatePassword: "Update Password",
        },
        twoFAModal: {
          title: "Two-Factor Authentication",
          description:
            "Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to log in.",
          cancel: "Cancel",
          enable2FA: "Enable 2FA",
        },
      },
    },
  },
  indonesian: {
    translation: {
      settings: {
        title: "Pengaturan",
        profile: "Profil",
        notification: "Notifikasi",
        language: "Bahasa",
        updatePicture: "Perbarui Gambar",
        fullName: "Nama Lengkap",
        emailAddress: "Alamat Email",
        role: "Peran",
        department: "Departemen",
        security: "Keamanan",
        password: "Kata Sandi",
        changePassword: "Ubah Kata Sandi Saya",
        twoFactorAuth: "Otentikasi Dua Faktor",
        enable: "Aktifkan",
        notificationSettings: "Pengaturan Notifikasi (dalam pengembangan)",
        emailNotifications: "Notifikasi Email",
        inAppNotifications: "Notifikasi Dalam Aplikasi",
        taskUpdates: "Pembaruan Tugas",
        mentions: "Penyebutan",
        saveChanges: "Simpan Perubahan",
        languageSettings: "Pengaturan Bahasa",
        chooseLanguage:
          "Pilih bahasa yang Anda inginkan untuk antarmuka aplikasi.",
        english: "Inggris",
        indonesian: "Bahasa Indonesia",
        spanish: "Spanyol",
        changePasswordModal: {
          title: "Ubah Kata Sandi",
          currentPassword: "Kata Sandi Saat Ini",
          newPassword: "Kata Sandi Baru",
          confirmNewPassword: "Konfirmasi Kata Sandi Baru",
          cancel: "Batal",
          updatePassword: "Perbarui Kata Sandi",
        },
        twoFAModal: {
          title: "Otentikasi Dua Faktor",
          description:
            "Otentikasi dua faktor menambahkan lapisan keamanan tambahan ke akun Anda dengan memerlukan lebih dari sekadar kata sandi untuk masuk.",
          cancel: "Batal",
          enable2FA: "Aktifkan 2FA",
        },
      },
    },
  },
  spanish: {
    translation: {
      settings: {
        title: "Configuración",
        profile: "Perfil",
        notification: "Notificación",
        language: "Idioma",
        updatePicture: "Actualizar Imagen",
        fullName: "Nombre Completo",
        emailAddress: "Dirección de Correo Electrónico",
        role: "Rol",
        department: "Departamento",
        security: "Seguridad",
        password: "Contraseña",
        changePassword: "Cambiar Mi Contraseña",
        twoFactorAuth: "Autenticación de Dos Factores",
        enable: "Habilitar",
        notificationSettings: "Configuración de Notificaciones (en desarrollo)",
        emailNotifications: "Notificaciones por Correo Electrónico",
        inAppNotifications: "Notificaciones en la Aplicación",
        taskUpdates: "Actualizaciones de Tareas",
        mentions: "Menciones",
        saveChanges: "Guardar Cambios",
        languageSettings: "Configuración de Idioma",
        chooseLanguage:
          "Elige tu idioma preferido para la interfaz de la aplicación.",
        english: "Inglés",
        indonesian: "Bahasa Indonesia",
        spanish: "Español",
        changePasswordModal: {
          title: "Cambiar Contraseña",
          currentPassword: "Contraseña Actual",
          newPassword: "Nueva Contraseña",
          confirmNewPassword: "Confirmar Nueva Contraseña",
          cancel: "Cancelar",
          updatePassword: "Actualizar Contraseña",
        },
        twoFAModal: {
          title: "Autenticación de Dos Factores",
          description:
            "La autenticación de dos factores agrega una capa adicional de seguridad a tu cuenta al requerir más que solo una contraseña para iniciar sesión.",
          cancel: "Cancelar",
          enable2FA: "Habilitar 2FA",
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "english", // Bahasa default
  fallbackLng: "english",
  interpolation: {
    escapeValue: false, // React sudah menangani escaping
  },
});

export default i18n;
