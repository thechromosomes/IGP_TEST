<template>
  <div class="main_div">
    <client-only>
      <h1 class="title">
        Please enter your
        {{ showOtp ? `OTP sent to your mobile number` : `mobile number` }}
      </h1>
      <div>
        <label for="newnumber">Mobile Number*</label>
        <input
          type="text"
          v-model.number="mobileNumber"
          maxlength="11"
          ref="mobile_number"
          name="newnumber"
          autocomplete="off"
          class="input_box"
        />
        <div class="error_div">
          <span class="input-error text-red" v-if="pageError != ''">
            {{ pageError }}</span
          >
          <!-- an error display tags -->
          <span v-if="validation.hasError('mobileNumber')">
            <p class="input-error">
              {{ validation.firstError("mobileNumber") }}
            </p>
          </span>
        </div>
      </div>
      <div class="inputWrapper" v-if="showOtp">
        <label for="otp" class="label">One Time Password (OTP)*</label>
        <input
          type="text"
          v-model="otpNumber"
          name="otp"
          id="otp"
          class="input_box"
          maxlength="4"
          autocomplete="off"
        />
        <div class="error_div">
          <span class="input-error" v-if="otpPageError != ''">
            {{ otpPageError }}</span
          >
          <!-- an error display tags -->
          <span v-if="validation.hasError('otpNumber')">
            <p class="input-error">
              {{ validation.firstError("otpNumber") }}
            </p>
          </span>
        </div>
      </div>

      <div class="action_bottom" v-if="!showOtp && sendButton">
        <button @click="registeruser()">Send OTP</button>
      </div>
      <div class="action_bottom" v-else-if="showOtp">
        <button @click="registeruserOtp()">Continue</button>
      </div>
      <div class="errorMsg"></div>

      <!-- vue recaptch -->
      <vue-recaptcha
        ref="invisibleRecaptcha"
        @verify="recaptchaSuccess"
        @expired="onExpired"
        @error="recaptchaError"
        size="invisible"
        :sitekey="$store.state.Captcha_Site_key"
        :loadRecaptchaScript="true"
      ></vue-recaptcha>
    </client-only>
  </div>
</template>

<script>
import VueRecaptcha from "vue-recaptcha";
import { Validator } from "simple-vue-validator";

export default {
  components: { VueRecaptcha },
  data() {
    return {
      mobileNumber: "",
      pageError: "",
      showOtp: false,
      otpNumber: "",
      otpPageError: "",
      captchaToken: "",
      sendButton: false,
      timeout: null,
    };
  },

  // form validatiors
  validators: {
    mobileNumber: function (value) {
      return Validator.value(value)
        .required()
        .integer()
        .minLength(10)
        .maxLength(10);
    },
    otpNumber: function (value) {
      return Validator.value(value)
        .required()
        .integer()
        .minLength(4)
        .maxLength(4);
    },
  },

  methods: {
    async registeruser() {
      var validation = await this.$validate();

      try {
        if (/^(\+\d{1,3}[- ]?)?\d{10}$/.test(this.mobileNumber)) {
          if (this.captchaToken == "") {
            this.pageError = "Error occured, please try captch validation";
            return;
          }
          if (!validation) {
            this.pageError = "Error occured, please input a valid number";
          }

          let form = {
            phone: this.mobileNumber,
            captcha: this.captchaToken,
          };

          let response = await this.$store.dispatch("universalApiCall", {
            method: "post",
            url: `/send-otp`,
            params: form,
          });
          if (response.success) {
            this.showOtp = true;
            this.pageError = "";
          } else {
            if (
              !response.success &&
              response.data &&
              response.data.blocked == 1
            ) {
              this.pageError = response.message;
            } else {
              throw response.message;
            }
          }
        } else {
          this.pageError = "Please enter valid mobile number";
        }
      } catch (error) {
        this.pageError = "Error occured. Please try reloading and check number";
        this.$globalError(`error from log in page (registeruser)>>>> ${error}`);
      }
    },

    async registeruserOtp() {
      try {
        var otpno = /^\d*(?:\.\d{1,2})?$/;
        if (this.otpNumber != "" && this.otpNumber.match(otpno)) {
          var form = {};

          form.otp = this.otpNumber;
          form.phone = this.mobileNumber;

          let response = await this.$store.dispatch("universalApiCall", {
            method: "post",
            url: `/validate-otp`,
            params: form,
          });
          if (response.success) {
            this.$store.commit("registerUser", {
              payload: response.data,
              vm: this,
            });
          } else {
            this.otpPageError = response.message;
            throw "Error while requesting";
          }
        } else {
          this.otpPageError = "please enter valid otp";
        }
      } catch (error) {
        this.$globalError(
          `error from log in page (registeruserOtp) >>>> ${error}`
        );
        console.log("error from log in page", error);
      }
    },

    test() {
      console.log("test");
      this.$store.commit("registerUser", {
        payload: "response",
        vm: this,
      });
    },

    recaptchaSuccess(recaptchaToken) {
      this.captchaToken = recaptchaToken;
    },
    onExpired() {
      this.captchaToken = "";
    },
    recaptchaError() {
      this.captchaToken = "";
      this.$globalError(
        "Google Recaptcha Error. Please contact administration'"
      );
    },
  },

  watch: {
    mobileNumber: function () {
      if (/^(\+\d{1,3}[- ]?)?\d{10}$/.test(this.mobileNumber)) {
        this.$refs.invisibleRecaptcha.execute();
        this.timeout = setTimeout(() => {
          this.sendButton = true;
        }, 1500);
      } else {
        this.showOtp = false;
        this.pageError = "";
      }
    },
  },
};
</script>

<style scoped>
.input_box {
  border: solid;
}

.main_div {
  text-align: center;
  justify-content: center;
}
.action_bottom button {
  border: solid;
  margin-top: 10px;
  padding: 10px;
  text-align: center;
}

.input-error {
  color: red;
}
</style>

