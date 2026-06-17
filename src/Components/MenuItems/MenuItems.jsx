import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ViewCarouselOutlinedIcon from "@mui/icons-material/ViewCarouselOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";

export const menuSections = [
  {
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/",
        icon: DashboardOutlinedIcon,
      },
      {
        label: "Analytics",
        path: "/analytics",
        icon: InsightsOutlinedIcon,
      },
      {
        label: "Product Dashboard",
        path: "/product-dashboard",
        icon: Inventory2OutlinedIcon,
      },
      {
        label: "Sales Dashboard",
        path: "/sales-dashboard",
        icon: TrendingUpOutlinedIcon,
      },
      {
        label: "Inventory Dashboard",
        path: "/inventory-dashboard",
        icon: LayersOutlinedIcon,
      },
    ],
  },
  {
    section: "Catalog",
    items: [
      {
        label: "Products",
        path: "/products",
        icon: Inventory2OutlinedIcon,
        badge: 24,
      },
      {
        label: "Inventory",
        path: "/inventory",
        icon: LayersOutlinedIcon,
        badge: 3,
      },
      {
        label: "Categories",
        path: "/categories",
        icon: CategoryOutlinedIcon,
      },
    ],
  },
  {
    section: "Commerce",
    items: [
      {
        label: "Orders",
        path: "/orders",
        icon: ShoppingBagOutlinedIcon,
        badge: 7,
      },
      {
        label: "Customers",
        path: "/customers",
        icon: PeopleOutlineOutlinedIcon,
      },
      {
        label: "Coupons",
        path: "/coupons",
        icon: LocalOfferOutlinedIcon,
      },
    ],
  },
  {
    section: "CMS",
    items: [
      {
        label: "Banners",
        path: "/banners",
        icon: ViewCarouselOutlinedIcon,
      },
      {
        label: "Pages",
        path: "/pages",
        icon: DescriptionOutlinedIcon,
      },
      {
        label: "Uploads",
        path: "/uploads",
        icon: UploadFileOutlinedIcon,
      },
    ],
  },
  {
    section: "Support",
    items: [
      {
        label: "Contact Messages",
        path: "/admin/contact-messages", 
        icon: MailOutlineOutlinedIcon,
      },
    ],
  },
  {
    section: "Account",
    items: [
      {
        label: "Logout",
        path: "/logout",
        icon: LogoutOutlinedIcon,
      },
    ],
  },
];

export const flattenMenuItems = menuSections.flatMap((section) => section.items);
