const router = require("express").Router();
const authController = require("../controllers/auth_controller");
const validatorMiddleware = require("../middlewares/validation_middleware");
const authMiddleware = require("../middlewares/auth_middleware");

router.get(
  "/login",
  authMiddleware.oturumAcilmamis,
  authController.loginFormunuGoster
);
router.post(
  "/login",
  authMiddleware.oturumAcilmamis,
  validatorMiddleware.validateLogin(),
  authController.login
);
//express-validatörde çağırma () ile yapılıyor
router.get(
  "/register",
  authMiddleware.oturumAcilmamis,
  authController.registerFormunuGoster
);
router.post(
  "/register",
  authMiddleware.oturumAcilmamis,
  validatorMiddleware.validateNewUser(),
  authController.register
);
//SİFRE UNUTMADA MAİL İLE YÖNLENDİRİLEN YENİ ŞİFRE BELİRLEME SAYFALARI
router.get("/reset-password/:id/:token", authController.yeniSifreFormuGoster);
//id ve token bilgisi olmadığı zaman gidilecek route
//aynı callbace gönderiyoruz veriler olmadığı durumdaki şarta göre çalışıyor
router.get("/reset-password", authController.yeniSifreFormuGoster);
//kullanıcı new_password de sifreyi submit edince oluşan post isteğini ele alıyoruz
router.post(
  "/reset-password",
  validatorMiddleware.validateNewPassword(),
  authController.yeniSifreyiKaydet
);
router.get(
  "/forget-password",
  authMiddleware.oturumAcilmamis,
  authController.forgetPasswordFormunuGoster
);
router.post(
  "/forget-password",
  authMiddleware.oturumAcilmamis,
  validatorMiddleware.validateEmail(),
  authController.forgetPassword
);
router.get("/verify", authController.verifyMail);
router.get("/logout", authMiddleware.oturumAcilmis, authController.logout);

module.exports = router;
