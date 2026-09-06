/* =========================================================
   Techs Academy - forms.js
   Web3Forms + Form Validation
   ========================================================= */

(() => {
  "use strict";

  /*
    All forms that need Web3Forms should have:

    <form class="w3-form">

    And:

    <input
      type="hidden"
      name="access_key"
      value="YOUR_WEB3FORMS_ACCESS_KEY"
    >
  */

  const forms = document.querySelectorAll("form.w3-form");

  if (!forms.length) {
    return;
  }

  /* =========================================================
     Validation Rules
     ========================================================= */

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const phoneRegex =
    /^[+]?[0-9\s().-]{7,20}$/;


  /* =========================================================
     Get Field Value
     ========================================================= */

  function getValue(form, name) {
    const field = form.elements.namedItem(name);

    if (!field) {
      return "";
    }

    return String(field.value || "").trim();
  }


  /* =========================================================
     Status Message
     ========================================================= */

  function getStatusElement(form) {

    let status =
      form.querySelector(".form-status");

    if (!status) {

      status =
        document.createElement("div");

      status.className =
        "form-status";

      status.setAttribute(
        "role",
        "status"
      );

      status.setAttribute(
        "aria-live",
        "polite"
      );

      form.appendChild(status);
    }

    return status;
  }


  function showStatus(
    form,
    type,
    message
  ) {

    const status =
      getStatusElement(form);

    status.textContent =
      message;

    status.dataset.type =
      type;

    status.style.marginTop =
      "14px";

    status.style.padding =
      "10px 0";

    status.style.fontSize =
      "14px";

    status.style.lineHeight =
      "1.5";

    if (type === "success") {

      status.style.color =
        "#d8a74a";

    } else if (type === "error") {

      status.style.color =
        "#ff7777";

    } else {

      status.style.color =
        "#cccccc";
    }
  }


  /* =========================================================
     Validation
     ========================================================= */

  function validateForm(form) {

    /*
      Browser required validation
    */

    if (!form.checkValidity()) {

      const invalid =
        form.querySelector(":invalid");

      if (invalid) {

        invalid.focus();

        invalid.reportValidity();
      }

      return (
        "Please fill all required fields correctly."
      );
    }


    /*
      Email validation
    */

    const email =
      getValue(form, "email");

    if (
      email &&
      !emailRegex.test(email)
    ) {

      const emailField =
        form.elements.namedItem("email");

      if (emailField) {
        emailField.focus();
      }

      return (
        "Please enter a valid email address."
      );
    }


    /*
      Phone validation
    */

    const phone =
      getValue(form, "phone");

    if (
      phone &&
      !phoneRegex.test(phone)
    ) {

      const phoneField =
        form.elements.namedItem("phone");

      if (phoneField) {
        phoneField.focus();
      }

      return (
        "Please enter a valid phone number."
      );
    }


    /*
      Message validation
    */

    const message =
      getValue(form, "message");

    if (
      message &&
      message.length < 10
    ) {

      const messageField =
        form.elements.namedItem("message");

      if (messageField) {
        messageField.focus();
      }

      return (
        "Please provide a little more detail in your message."
      );
    }


    return null;
  }


  /* =========================================================
     Submit Form to Web3Forms
     ========================================================= */

  async function submitToWeb3Forms(form) {

    const accessKey =
      getValue(
        form,
        "access_key"
      );


    /*
      Access key check
    */

    if (
      !accessKey ||
      accessKey ===
        "YOUR_WEB3FORMS_ACCESS_KEY"
    ) {

      throw new Error(
        "Web3Forms access key is missing."
      );
    }


    /*
      Honeypot bot protection
    */

    const botCheck =
      getValue(
        form,
        "botcheck"
      );

    if (botCheck) {

      return {
        success: true,
        bot: true
      };
    }


    /*
      Convert form to FormData
    */

    const formData =
      new FormData(form);


    /*
      Dynamic email subject
    */

    formData.set(
      "subject",
      form.dataset.formSubject ||
        `Techs Academy - ${
          form.dataset.formName ||
          "Website Enquiry"
        }`
    );


    /*
      Sender name
    */

    formData.set(
      "from_name",
      "Techs Academy Website"
    );


    /*
      Reply-to email
    */

    const email =
      getValue(
        form,
        "email"
      );

    if (email) {

      formData.set(
        "replyto",
        email
      );
    }


    /*
      Send request
    */

    const response =
      await fetch(
        "https://api.web3forms.com/submit",
        {
          method: "POST",

          body: formData,

          headers: {
            Accept:
              "application/json"
          }
        }
      );


    /*
      Parse response
    */

    let result = {};

    try {

      result =
        await response.json();

    } catch (error) {

      throw new Error(
        "Invalid response from Web3Forms."
      );
    }


    /*
      Web3Forms error
    */

    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(
        result.message ||
          "Unable to submit the form."
      );
    }


    return result;
  }


  /* =========================================================
     Handle Every Form
     ========================================================= */

  forms.forEach((form) => {

    form.addEventListener(
      "submit",
      async (event) => {

        /*
          Stop normal HTML submission
        */

        event.preventDefault();


        /*
          Validate
        */

        const validationError =
          validateForm(form);


        if (validationError) {

          showStatus(
            form,
            "error",
            validationError
          );

          return;
        }


        /*
          Submit button
        */

        const submitButton =
          form.querySelector(
            'button[type="submit"], input[type="submit"]'
          );


        const originalText =
          submitButton
            ? (
                submitButton.tagName ===
                "INPUT"
                  ? submitButton.value
                  : submitButton.textContent
              )
            : "";


        /*
          Disable button
        */

        if (submitButton) {

          submitButton.disabled =
            true;


          if (
            submitButton.tagName ===
            "INPUT"
          ) {

            submitButton.value =
              "Sending...";

          } else {

            submitButton.textContent =
              "Sending...";
          }
        }


        /*
          Sending message
        */

        showStatus(
          form,
          "sending",
          "Sending your request..."
        );


        try {

          /*
            Submit
          */

          const result =
            await submitToWeb3Forms(
              form
            );


          /*
            Bot submission
          */

          if (result.bot) {

            form.reset();

            showStatus(
              form,
              "success",
              "Thank you! Your request has been received."
            );

            return;
          }


          /*
            Successful submission
          */

          form.reset();


          showStatus(
            form,
            "success",
            form.dataset.successMessage ||
              "Thank you! Your request has been submitted successfully. We will contact you soon."
          );


          /*
            Google Analytics conversion
          */

          if (
            typeof window.gtag ===
            "function"
          ) {

            window.gtag(
              "event",
              "form_submit",
              {
                event_category:
                  "Lead",

                event_label:
                  form.dataset.formName ||
                  "Website Form"
              }
            );
          }

        } catch (error) {

          console.error(
            "Web3Forms error:",
            error
          );


          showStatus(
            form,
            "error",
            "Something went wrong while sending your request. Please try again."
          );

        } finally {

          /*
            Enable button again
          */

          if (submitButton) {

            submitButton.disabled =
              false;


            if (
              submitButton.tagName ===
              "INPUT"
            ) {

              submitButton.value =
                originalText;

            } else {

              submitButton.textContent =
                originalText;
            }
          }
        }

      }
    );

  });

})();