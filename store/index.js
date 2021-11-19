export const state = () => ({
  Captcha_Site_key: process.env.CAPTCHA_SITE_KEY || "",
  Base_url: process.env.BASE_URL || "",
  store: "",
  customer_session: "",
  customer_id: "",
  customer_token: "",
});

export const actions = {
  universalApiCall(context, data) {
    let request = data.params;
    var authOptions = {
      method: data.method,
      url: context.state.Base_url + data.url,
      headers: {
        "Content-Type": "application/json",
      },
      params: request,
    };
    return new Promise((resolve, reject) => {
      this.$axios(authOptions)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          this.$globalError(`error from pimAjax action >>>> ${error}`);
          reject(error);
        });
    });
  },
};

export const mutations = {
  registerUser(state, data) {
    //   update central state
    state.customer_session = data.payload.customer_session;
    state.customer_id = data.payload.customer.id;
    state.customer_token = data.payload.token;

    state.store = data.payload.store;

    //  update cookie
    var now = new Date();
    var time = now.getTime();
    time += 3600 * 1000;
    now.setTime(time);

    document.cookie =
      "customer_session=" +
      data.payload.customer_session +
      ";" +
      "expires=" +
      now.toUTCString();
    document.cookie =
      "customer_id=" +
      data.payload.customer.id +
      ";" +
      "expires=" +
      now.toUTCString();
    this.$router.push("/Dashboard");
  },
};
