
let sessionActive = false;
const loadHomepage = async (req, res) => {
    try {
        console.log("hii");
        // retur
        return res.render("home"); // Render the home view
    } catch (error) {
        console.error("Error rendering home page:", error.message);
        console.log("Error handler");
        res.status(500).send("Server error");
    }
};

const loadLogin = async (req, res, next) => {
    try {
      if (!sessionActive) {
        return res.render("login");
      } else {
        res.redirect("/");
      }
    } catch (error) {
      next(error);
    }
  };

const login = async (req, res, next) => {
    try {
    
      const { email, password, googleId } = req.body;
  
      let findUser = await User.findOne({ email: email }).populate('cart wallet');
  
      if (googleId) {
        if (!findUser) {
        
          findUser = new User({
            email: email,
            googleId: googleId,
            role: "user",
            isVerified: true
          });
          await findUser.save(); 
        
        
          const newWallet = new Wallet({ user: findUser._id, balance: 0 });
          await newWallet.save();
          findUser.wallet = newWallet._id;
  
          const newCart = new Cart({ userId: findUser._id, items: [] });
          await newCart.save();
          findUser.cart = newCart._id;
  
          await findUser.save();
        } else {
          
          if (!findUser.googleId) {
          
            findUser.googleId = googleId;
          }
  
      
          if (!findUser.wallet) {
            const newWallet = new Wallet({ user: findUser._id, balance: 0 });
            await newWallet.save();
            findUser.wallet = newWallet._id;
          }
  
          if (!findUser.cart) {
            const newCart = new Cart({ userId: findUser._id, items: [] });
            await newCart.save();
            findUser.cart = newCart._id;
          }
  
          await findUser.save();
        }
  
        req.session.user = findUser.toObject(); 
        sessionActive = true;
        return res.redirect("/");
      }
  
      if (!findUser) {
        return res.render("login", { message: "User not found" });
      }
  
      if (findUser.isBlocked) {
        return res.render("login", { message: "User is blocked by admin" });
      }
  
      if (!findUser.password) {
        return res.render("login", { message: "Please use Google Sign-In for this account" });
      }
  
      const passwordMatch = await bcrypt.compare(password, findUser.password);
  
      if (!passwordMatch) {
        return res.render("login", { message: "Incorrect password" });
      }
  
      req.session.user = findUser._id;
      sessionActive = true;
  
      res.redirect("/");
  
    } catch (error) {
      console.error("Login error:", error);
      next(error);
    }
  };

module.exports = {
    loadHomepage,loadLogin,login,
};
