import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } =
    await authenticate.webhook(request);

  if (!admin && topic !== "SHOP_REDACT") {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    // The SHOP_REDACT webhook will be fired up to 48 hours after a shop uninstalls the app.
    // Because of this, no admin context is available.
    throw new Response();
  }

  // The topics handled here should be declared in the shopify.app.toml.
  // More info: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
  switch (topic) {
    case "APP_UNINSTALLED":
      try {
        if (session) {
          await db.session.deleteMany({ where: { shop } });
        }
        break;
      } catch (error) {
        console.error("Error APP_UNINSTALLED:", error);
        throw new Error("Error APP_UNINSTALLED");
      }
    case "CUSTOMERS_DATA_REQUEST":
      try {
        // await RequestData({ shop });
        break;
      } catch (error) {
        console.error("Error CUSTOMERS_DATA_REQUEST:", error);
        throw new Error("Error CUSTOMERS_DATA_REQUEST");
      }
    case "CUSTOMERS_REDACT":
      try {
        // await DeleteData({ shop });
        break;
      } catch (error) {
        console.error("Error CUSTOMERS_REDACT:", error);
        throw new Error("Error CUSTOMERS_REDACT");
      }
    case "SHOP_REDACT":
      try {
        // await CleanData({ shop });
        break;
      } catch (error) {
        console.error("Error SHOP_REDACT:", error);
        throw new Error("Error SHOP_REDACT");
      }
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
