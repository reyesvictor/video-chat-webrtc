import Swal from "sweetalert2";

type Icon = "success" | "error" | "warning" | "info" | "question";

export const toast = (icon: Icon, title: string) => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-right",
    iconColor: "white",
    customClass: {
      popup: "colored-toast",
    },
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });

  return Toast.fire({
    icon,
    title,
  });
};
