const express = require("express");
const router = express.Router();

const {
    addRequestForQuotation,
    getRequestForQuotation,
    deleteRequestForQuotationById,
    updateRequestForQuotation,
    getRequestForQuotationById
} = require("../controllers/requestForQuotation");

const {
    requireSignin,
    adminMiddleware,
  } = require("../common-middleware");

  router.post(
    "/requestforquotation/create",
    addRequestForQuotation
  );

  router.get("/requestforquotation/getrequestforquotation",getRequestForQuotation);

  router.get("/requestforquotation/getrequestforquotation/:id",getRequestForQuotationById);

  router.patch("/requestforquotation/update", requireSignin,adminMiddleware,updateRequestForQuotation);
  
  router.post("/requestforquotation/delete", requireSignin,adminMiddleware,deleteRequestForQuotationById);
  
  module.exports = router;
