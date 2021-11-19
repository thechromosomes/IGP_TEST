<template>
  <div>
    <h1>this is dashboard page</h1>
  </div>
</template>

<script>
export default {
  async fetch() {
    let response = await this.$store.dispatch("universalApiCall", {
      method: "post",
      url: `/account-details`,
      params: {
        customer_id: this.$store.state.customer_id,
        customer_session: this.$store.state.customer_session,
        store: 1,
      },
    });

    console.log(response);
  },
};
</script>