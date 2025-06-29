// Admin authorization middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({
      error: "Access denied. Admin privileges required.",
    })
  }
}

// Super admin authorization middleware
export const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === "super_admin") {
    next()
  } else {
    res.status(403).json({
      error: "Access denied. Super admin privileges required.",
    })
  }
}

// Admin or super admin authorization middleware
export const adminOrSuperAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "super_admin")) {
    next()
  } else {
    res.status(403).json({
      error: "Access denied. Admin privileges required.",
    })
  }
}
