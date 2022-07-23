const LocalStrategy = require("passport-local").Strategy; //email ve sifre giris
const User = require("../model/user_model");
const bcrypt = require("bcrypt");
//passport nesnesi geçiyoruz parametre olarak
module.exports = function (passport) {
  //options alanında pasportda randon atanan usaername ve pasword alanlarına bizim register formda name alanında
  //verdiğimiz değerlere göre kullanıcıyı neyle login edeceksek onları belirtiyoruz (email,sifre)
  const options = {
    usernameField: "email",
    passwordField: "sifre",
  };
  //passport u hangi strategy ile kullanacağımızı belirtiyoruz
  passport.use(
    //1. belirlediğimiz options u parametre olarak geçiyoruz
    //2. optionstaki değerlere göre yapacağımız verify işlemi
    //
    new LocalStrategy(options, async (email, sifre, done) => {
      try {
        const _bulunanUser = await User.findOne({ email: email });

        if (!_bulunanUser) {
          //hata için null
          return done(null, false, { message: "User bulunamadı" });
        }
        //sifre kıyas
        const sifreKontrol = await bcrypt.compare(sifre, _bulunanUser.sifre);
        if (!sifreKontrol) {
          return done(null, false, { message: "Şifre hatalı" });
        } else {
          if (_bulunanUser && _bulunanUser.emailAktif === false) {
            return done(null, false, { message: "Lütfen emailiniz onaylayın" });
          } else return done(null, _bulunanUser);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  //bulunan userin id sinin cookie de saklanması
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  //cokiede bulunan user id ile userın db den bulunup dönderilmesi işlemi
  //requeste bu user bilgisi eklenmiş oluyor ve req.user denince ulaşabiliyoruz
  // serializeUser da done ile kaydedilen user.id buraya id parametresi olarak geçiliyor
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      const yeniUser = {
        id: user.id,
        email: user.email,
        ad: user.ad,
        soyad: user.soyad,
        sifre: user.sifre,
        olusturulmaTarihi: user.createdAt,
      };
      done(err, yeniUser);
    });
  });
};
