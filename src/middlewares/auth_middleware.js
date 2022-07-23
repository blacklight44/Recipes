const oturumAcilmis = function (req, res, next) {
  //pasporttan gelen method
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", ["Lütfen önce oturum açın"]);
    res.redirect("/login");
  }
};

module.exports = {
  oturumAcilmis,
};
