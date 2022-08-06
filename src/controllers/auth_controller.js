const { validationResult } = require("express-validator"); //validatör hatalar
const User = require("../model/user_model");
const passport = require("passport");
require("../config/passport_local")(passport);
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const loginFormunuGoster = (req, res, next) => {
  res.render("login", {
    layout: "./layout/auth_layout.ejs",
    title: "Giriş Yap",
  });
};

const login = (req, res, next) => {
  const hatalar = validationResult(req);
  // console.log(hatalarDizisi);
  //input valularını doldurmak için flashla alıyoruz
  req.flash("email", req.body.email);
  req.flash("sifre", req.body.sifre);
  //HATA VARSA logine redirect flash mesajla
  if (!hatalar.isEmpty()) {
    req.flash("validation_error", hatalar.array());

    console.log(req.session);
    res.redirect("/login");
  } else {
    //HATA YOKSA AUTH işlemleri
    passport.authenticate("local", {
      successRedirect: "/yonetim",
      failureRedirect: "/login",
      failureFlash: true,
    })(req, res, next);
  }
};

const registerFormunuGoster = (req, res, next) => {
  req.flash("validation_error").forEach((element) => {
    console.log(element);
  });

  res.render("register", {
    layout: "./layout/auth_layout.ejs",
    title: "Kayıt Ol",
  });
};

const register = async (req, res, next) => {
  const hatalar = validationResult(req); //validationda gelen hatalar
  // console.log(hatalarDizisi);
  if (!hatalar.isEmpty()) {
    //key value olarak hatalar dizisini ve formu değerlerini baştan doldurtmamak için post bodysinden
    //aldığımız girilen bi önceki tüm değerleri flash a ekliyoruz
    req.flash("validation_error", hatalar.array()); //arayüzde ele almak için array a çeviriyoruz
    req.flash("email", req.body.email);
    req.flash("ad", req.body.ad);
    req.flash("soyad", req.body.soyad);
    req.flash("sifre", req.body.sifre);
    req.flash("resifre", req.body.resifre);

    //console.log(req.session);
    //res.render respons sonlandır viewa yolla iken res.redirect respons sonlanmadan tekrar şu soraya git oluyor
    //hata çıktığı durumda responsı tekrar registera yönlendiriyoruz
    //fakat renderdaki gibi parametrelerimizi geçemediğimizden flash kullanıyoruz
    res.redirect("/register"); //registerFormunuGoster e get isteği oluşturuyor
  } else {
    //VALİDATİON ERROR YOKSA
    try {
      const _user = await User.findOne({ email: req.body.email });
      // FAKAT MAİL DAHA ÖNCE KAYITLIYSA
      if (_user && _user.emailAktif == true) {
        //daha önceki yapı array olduğundan mesajı array ve msg alanı olan
        //bir mesaj(element.msg olarak alacağımız için) olarak veriyoruz
        req.flash("validation_error", [{ msg: "Bu mail kullanımda" }]);
        //TEKRAR valulara atamak için
        req.flash("email", req.body.email);
        req.flash("ad", req.body.ad);
        req.flash("soyad", req.body.soyad);
        req.flash("sifre", req.body.sifre);
        req.flash("resifre", req.body.resifre);
        //yine redirect
        res.redirect("/register");
        //MAİL KAYITLI FAKAT DOĞRULANMAMIŞSA
      } else if ((_user && _user.emailAktif == false) || _user == null) {
        if (_user) {
          //email aktif değil ama daha önce kayıt varsa varolan kullanıcıyı sil ki tekrar yeniden oluşturabilelim
          //yoksa email daha önce varolduğundan db den hata alıyoruz
          await User.findByIdAndRemove({ _id: _user._id });
        }
        const newUser = new User({
          email: req.body.email,
          ad: req.body.ad,
          soyad: req.body.soyad,
          sifre: await bcrypt.hash(req.body.sifre, 10),
        });
        await newUser.save();
        console.log("kullanıcı kaydedildi");

        //jwt işlemleri
        //token içinde saklanacak bilgiler
        const jwtBilgileri = {
          id: newUser.id,
          mail: newUser.email,
        };
        //TOKEN in oluşturulması
        const jwtToken = jwt.sign(
          jwtBilgileri,
          process.env.CONFIRM_MAIL_JWT_SECRET,
          { expiresIn: "1d" }
        );
        console.log(jwtToken);

        //MAIL GONDERME ISLEMLERI
        //maile gönderilecek url içersinde verify routena yönlendiriyoruz
        const url = process.env.WEB_SITE_URL + "verify?id=" + jwtToken;
        console.log("gidilecek url:" + url);
        //kullanılacak servis ve kullanıcı bilgilerinin olduğu nesnesyi tanımlıyoruz
        let transporter = nodemailer.createTransport({
          service: "gmail",
          //https://www.freecodecamp.org/news/use-nodemailer-to-send-emails-from-your-node-js-server/
          // auth: {
          //   type: "OAuth2",
          //   user: process.env.GMAIL_USER,
          //   pass: process.env.GMAIL_SIFRE,
          //   clientId: process.env.OAUTH_CLIENTID,
          //   clientSecret: process.env.OAUTH_CLIENT_SECRET,
          //   refreshToken: process.env.OAUTH_REFRESH_TOKEN,
          // },
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_SIFRE,
          },
        });

        await transporter.sendMail(
          {
            from: "Nodejs Uygulaması <jjjacoppp@gmail.com",
            to: newUser.email,
            subject: "Emailiniz Lütfen Onaylayın",
            text: "Emailinizi onaylamak için lütfen şu linki tıklayın:" + url,
          },
          (error, info) => {
            if (error) {
              console.log("bir hata var" + error);
            }
            console.log("Mail gönderildi");
            console.log(info);
            transporter.close();
          }
        );
        //flashla mail için login success ekrana mesaj
        req.flash("success_message", [
          { msg: "Lütfen mail kutunuzu kontrol edin" },
        ]);
        //login sayfasına yönlendirme
        res.redirect("/login");
      }
    } catch (err) {
      console.log("user kaydedilirken hata cıktı " + err);
    }
  }
};

const forgetPasswordFormunuGoster = (req, res, next) => {
  res.render("forget_password", {
    layout: "./layout/auth_layout.ejs",
    title: "Şifremi Unuttum",
  });
};
const forgetPassword = async (req, res, next) => {
  const hatalar = validationResult(req);

  if (!hatalar.isEmpty()) {
    req.flash("validation_error", hatalar.array());
    req.flash("email", req.body.email);

    //console.log(req.session);
    res.redirect("/forget-password");
  }
  //burası calısıyorsa kullanıcı düzgün bir mail girmiştir
  else {
    try {
      const _user = await User.findOne({
        email: req.body.email,
        emailAktif: true,
      });

      if (_user) {
        //kullanıcıya şifre sıfırlama maili atılabilir
        //MAIL İÇİN TOKEN
        const jwtBilgileri = {
          id: _user._id,
          mail: _user.email,
        };
        const secret =
          //sifre güncellendikten sonra token tekrar kullanılamasın diye secretı sifreyi geciyoruz
          process.env.RESET_PASSWORD_JWT_SECRET + "-" + _user.sifre;
        const jwtToken = jwt.sign(jwtBilgileri, secret, { expiresIn: "1d" });

        //MAIL GONDERME ISLEMLERI
        const url =
          process.env.WEB_SITE_URL +
          "reset-password/" +
          _user._id +
          "/" +
          jwtToken;

        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_SIFRE,
          },
        });

        await transporter.sendMail(
          {
            from: "Nodejs Uygulaması <info@nodejskursu.com",
            to: _user.email,
            subject: "Şifre Güncelleme",
            text: "Şifrenizi oluşturmak için lütfen şu linki tıklayın:" + url,
          },
          (error, info) => {
            if (error) {
              console.log("bir hata var" + error);
            }
            console.log("Mail gönderildi");
            console.log(info);
            transporter.close();
          }
        );

        req.flash("success_message", [
          { msg: "Lütfen mail kutunuzu kontrol edin" },
        ]);
        res.redirect("/login");
      } else {
        req.flash("validation_error", [
          { msg: "Bu mail kayıtlı değil veya Kullanıcı pasif" },
        ]);
        req.flash("email", req.body.email);
        res.redirect("forget-password");
      }
      //jwt işlemleri
    } catch (err) {
      console.log("user kaydedilirken hata cıktı " + err);
    }
  }

  //res.render('forget_password', { layout: './layout/auth_layout.ejs' });
};

const logout = (req, res, next) => {
  req.logout(); // session altındaki pasport kısmındaki id yi siliyor
  //SESSİONUDA SİLMEK İÇİN
  req.session.destroy((error) => {
    res.clearCookie("connect.sid");
    //cookieler silindiğinden flash çalışmıyor
    //req.flash('success_message', [{ msg: 'Başarıyla çıkış yapıldı' }]);
    res.render("login", {
      layout: "./layout/auth_layout.ejs",
      title: "Giriş Yap",
      success_message: [{ msg: "Başarıyla çıkış yapıldı" }],
    });
    //REDİRECT deyince  saveUninitialized: true yaptığımızdan yeni bir sayfaya geçtiğimizde
    //yeni bir cookie oluşturuyor bunu res.send le redirect yapmadan ayarlarsak çözülüyor
    //yada yukardaki gibi
    //res.redirect('/login');
    //res.send('çıkış yapıldı');
  });
};
const verifyMail = (req, res, next) => {
  //tokendeki id yi alıyoruz
  const token = req.query.id;
  if (token) {
    try {
      jwt.verify(
        token,
        process.env.CONFIRM_MAIL_JWT_SECRET,
        async (e, decoded) => {
          if (e) {
            req.flash("error", "Kod Hatalı veya Süresi Geçmiş");
            res.redirect("/login");
          } else {
            const tokenIcindekiIDDegeri = decoded.id; //tokendeki id yi secreta göre ayrıştırıp veriyor
            //emailAktifi db de true yapıyoruz
            const sonuc = await User.findByIdAndUpdate(tokenIcindekiIDDegeri, {
              emailAktif: true,
            });

            if (sonuc) {
              req.flash("success_message", [
                { msg: "Başarıyla mail onaylandı" },
              ]);
              res.redirect("/login");
            } else {
              req.flash("error", "Lütfen tekrar kullanıcı oluşturun");
              res.redirect("/login");
            }
          }
        }
      );
    } catch (err) {}
  } else {
    req.flash("error", "Token Yok veya Geçersiz");
    res.redirect("/login");
  }
};
const yeniSifreyiKaydet = async (req, res, next) => {
  const hatalar = validationResult(req);
  console.log(hatalar);

  if (!hatalar.isEmpty()) {
    //validation errorları ve önceki verileri bir hata varsa alıp reset-password rotasına gönderiyoruz
    //ordanda new_password sayfasına tekrar yönleniyor
    req.flash("validation_error", hatalar.array());
    req.flash("sifre", req.body.sifre);
    req.flash("resifre", req.body.resifre);

    console.log("formdan gelen değerler");
    console.log(req.body);
    //console.log(req.session);

    // eğer hata varsa tekrar linke tıklanmış gibi reset password e gönderip hataları gösteriyoruz
    res.redirect("/reset-password/" + req.body.id + "/" + req.body.token);
  } else {
    //hidden ile gizlediğimiz alandaki idyi başkasının id si ile güncelleyip
    //başka kullanıcının hesap şifresini yenilememesi için şifresi değiştirilecek kullanıcının id si ile
    //şifre değiştirme talebinde bulunan kullanıcının tokenindeki id aynımı değil mi kontrol ediyoruz
    const _bulunanUser = await User.findOne({
      _id: req.body.id,
      emailAktif: true,
    });

    const secret =
      process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;

    try {
      jwt.verify(req.body.token, secret, async (e, decoded) => {
        if (e) {
          req.flash("error", "Kod Hatalı veya Süresi Geçmiş");
          res.redirect("/forget-password");
        } else {
          //HATA YOKSA HASH LE YENİ SİFRENİN KAYDI
          const hashedPassword = await bcrypt.hash(req.body.sifre, 10);
          const sonuc = await User.findByIdAndUpdate(req.body.id, {
            sifre: hashedPassword,
          });

          if (sonuc) {
            req.flash("success_message", [
              { msg: "Başarıyla şifre güncellendi" },
            ]);
            res.redirect("/login");
          } else {
            req.flash(
              "error",
              "Lütfen tekrar şifre sıfırlama adımlarını yapın"
            );
            res.redirect("/login");
          }
        }
      });
    } catch (err) {
      console.log("hata cıktı" + err);
    }
  }
};
const yeniSifreFormuGoster = async (req, res, next) => {
  //gönderdiğimiz linke tıklandığında paramsın içindeki id ve tokeni alıyoruz
  const linktekiID = req.params.id;
  const linktekiToken = req.params.token;
  console.log(req.params.id);
  if (linktekiID && linktekiToken) {
    const _bulunanUser = await User.findOne({ _id: linktekiID }); //db den kullanıcıyı buluyoruz
    console.log(_bulunanUser);
    const secret =
      process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;

    try {
      jwt.verify(linktekiToken, secret, async (e, decoded) => {
        if (e) {
          req.flash("error", "Kod Hatalı veya Süresi Geçmiş");
          res.redirect("/forget-password");
        } else {
          res.render("new_password", {
            //id ve token değerlerinin kaybolmaması için parametre olarak req body e eklemek için gönderyoruz
            //daha sonra new_password.ejs de type hidden olan input içinde gizleyerek bodye eklenip gönderiliyor
            //ve yenisifre kaydette req.body.token seklinde yakalanıyor
            id: linktekiID,
            token: linktekiToken,
            layout: "./layout/auth_layout.ejs",
            title: "Şifre Güncelle",
          });
        }
      });
    } catch (err) {}
  } else {
    req.flash("validation_error", [
      { msg: "Lütfen maildeki linki tıklayın. Token Bulunamadı" },
    ]);

    res.redirect("forget-password");
  }
};
module.exports = {
  loginFormunuGoster,
  registerFormunuGoster,
  forgetPasswordFormunuGoster,
  register,
  login,
  forgetPassword,
  logout,
  verifyMail,
  yeniSifreFormuGoster,
  yeniSifreyiKaydet,
};
