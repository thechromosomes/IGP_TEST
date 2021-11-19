
export default (context, inject) => {
  try {
    const globalError = function (error) {
      console.log("error form global handler", error);
    };
    inject("globalError", globalError);
  } catch (error) {
    console.log("error from the global error >>>", error);
  }
};
