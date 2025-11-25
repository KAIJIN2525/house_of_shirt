import nodemailer from "nodemailer";

// Create email transporter
const createTransporter = () => {
  // For development, you can use Gmail or a test service like Mailtrap
  // For production, use a service like SendGrid, AWS SES, or Mailgun

  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password, not regular password
      },
    });
  } else if (process.env.EMAIL_SERVICE === "mailtrap") {
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST || "smtp.mailtrap.io",
      port: process.env.MAILTRAP_PORT || 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  } else {
    // SMTP configuration for custom email providers
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
};

// Send email verification
export const sendVerificationEmail = async (
  email,
  verificationToken,
  userName
) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"House of Shirt" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to: email,
      subject: "Verify Your Email - House of Shirt",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to House of Shirt! 👕</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName || "Valued Customer"}!</h2>
              <p>Thank you for registering with House of Shirt. We're excited to have you join our community!</p>
              <p>To complete your registration and start shopping, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with us, please ignore this email.</p>
              <p>Best regards,<br>The House of Shirt Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} House of Shirt. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to House of Shirt!
        
        Hello ${userName || "Valued Customer"}!
        
        Thank you for registering with House of Shirt. To complete your registration, please verify your email address by clicking the link below:
        
        ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create an account with us, please ignore this email.
        
        Best regards,
        The House of Shirt Team
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error: error.message };
  }
};

// Send low stock alert to admin
export const sendLowStockAlert = async (products) => {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    if (!adminEmail) {
      console.error("Admin email not configured");
      return { success: false, error: "Admin email not configured" };
    }

    // Generate product list HTML
    const productListHTML = products
      .map(
        (product) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${
            product.name
          }</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${
            product.variant
          }</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: ${
            product.stock <= 5 ? "#e74c3c" : "#f39c12"
          }"><strong>${product.stock}</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
            product.threshold
          }</td>
        </tr>
      `
      )
      .join("");

    const mailOptions = {
      from: `"House of Shirt Inventory" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to: adminEmail,
      subject: `⚠️ Low Stock Alert - ${products.length} Product${
        products.length > 1 ? "s" : ""
      } Running Low`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
            th { background: #34495e; color: white; padding: 12px; text-align: left; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #f39c12; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Low Stock Alert</h1>
            </div>
            <div class="content">
              <div class="warning">
                <strong>Attention Required!</strong> The following products are running low on stock and need to be restocked soon.
              </div>
              <p>Total products affected: <strong>${
                products.length
              }</strong></p>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Variant (Size/Color)</th>
                    <th>Current Stock</th>
                    <th>Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  ${productListHTML}
                </tbody>
              </table>
              <p><strong>Action Required:</strong> Please restock these items as soon as possible to avoid running out of inventory.</p>
              <p>You can manage your inventory in the <a href="${
                process.env.FRONTEND_URL
              }/admin/inventory">Admin Dashboard</a>.</p>
              <p>Best regards,<br>House of Shirt Inventory System</p>
            </div>
            <div class="footer">
              <p>This is an automated alert from your inventory management system.</p>
              <p>&copy; ${new Date().getFullYear()} House of Shirt. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Low Stock Alert - House of Shirt
        
        The following products are running low on stock:
        
        ${products
          .map(
            (p) =>
              `- ${p.name} (${p.variant}): ${p.stock} units remaining (threshold: ${p.threshold})`
          )
          .join("\n")}
        
        Please restock these items as soon as possible.
        
        Manage inventory at: ${process.env.FRONTEND_URL}/admin/inventory
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `Low stock alert sent to ${adminEmail} for ${products.length} products`
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending low stock alert:", error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"House of Shirt" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to: email,
      subject: "Password Reset Request - House of Shirt",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #f39c12; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName || "Valued Customer"}!</h2>
              <p>We received a request to reset your password for your House of Shirt account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <div class="warning">
                <strong>This link will expire in 1 hour.</strong>
              </div>
              <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              <p>Best regards,<br>The House of Shirt Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
};

// Send order status email
export const sendOrderStatusEmail = async (order, status) => {
  try {
    const transporter = createTransporter();
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Map status to template and subject
    const statusConfig = {
      created: {
        template: "order_created.html",
        subject: "Order Created - House of Shirt",
      },
      confirmed: {
        template: "order_confirmed.html",
        subject: "Order Confirmed - House of Shirt",
      },
      shipped: {
        template: "order_out_for_delivery.html",
        subject: "Your Order is Out for Delivery - House of Shirt",
      },
      delivered: {
        template: "order_delivered.html",
        subject: "Order Delivered - House of Shirt",
      },
    };

    const config = statusConfig[status];
    if (!config) {
      throw new Error(`Invalid order status: ${status}`);
    }

    // Read email template
    const templatePath = path.join(
      __dirname,
      "..",
      "views",
      "emails",
      config.template
    );
    let htmlTemplate = fs.readFileSync(templatePath, "utf8");

    // Format order date
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const confirmationDate = order.confirmedAt
      ? new Date(order.confirmedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : orderDate;

    const shippedDate = order.shippedAt
      ? new Date(order.shippedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    const deliveredDate = order.deliveredAt
      ? new Date(order.deliveredAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    // Format delivery time
    const deliveryTime = order.estimatedDeliveryDate
      ? new Date(order.estimatedDeliveryDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    // Format order items for table
    const orderItemsHtml = (order.orderItems || order.items || [])
      .map(
        (item) => `
      <tr>
        <td>${
          item.name || item.product?.name || item.productName || "Product"
        } ${item.size ? `(${item.size})` : ""}${
          item.color ? ` - ${item.color}` : ""
        }</td>
        <td>${item.quantity}</td>
        <td>₦${(item.price || 0).toLocaleString()}</td>
        <td><strong>₦${(
          (item.price || 0) * item.quantity
        ).toLocaleString()}</strong></td>
      </tr>
    `
      )
      .join("");

    // Calculate subtotal
    const subtotal = (order.orderItems || order.items || []).reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );

    // Format payment method
    const paymentMethodMap = {
      "bank-transfer": "Bank Transfer",
      paystack: "Paystack (Card Payment)",
      paypal: "PayPal",
    };

    const paymentStatusMap = {
      pending: "Pending",
      confirmed: "Confirmed",
      paid: "Paid",
      failed: "Failed",
    };

    // Replace placeholders in template
    htmlTemplate = htmlTemplate
      .replace(
        /\{\{customerName\}\}/g,
        order.shippingAddress?.fullName || "Customer"
      )
      .replace(
        /\{\{orderNumber\}\}/g,
        order.orderNumber || order._id.toString().slice(-8).toUpperCase()
      )
      .replace(/\{\{orderDate\}\}/g, orderDate)
      .replace(/\{\{confirmationDate\}\}/g, confirmationDate)
      .replace(/\{\{shippedDate\}\}/g, shippedDate)
      .replace(/\{\{deliveredDate\}\}/g, deliveredDate)
      .replace(
        /\{\{paymentMethod\}\}/g,
        paymentMethodMap[order.paymentMethod] || order.paymentMethod
      )
      .replace(
        /\{\{paymentStatus\}\}/g,
        paymentStatusMap[order.paymentStatus] || order.paymentStatus
      )
      .replace(/\{\{orderItems\}\}/g, orderItemsHtml)
      .replace(/\{\{subtotal\}\}/g, subtotal.toLocaleString())
      .replace(
        /\{\{deliveryFee\}\}/g,
        order.isFreeShipping
          ? '<span style="color: #10b981; font-weight: bold;">FREE</span>'
          : "₦" + (order.deliveryCost || 0).toLocaleString()
      )
      .replace(/\{\{totalAmount\}\}/g, order.totalAmount?.toLocaleString() || 0)
      .replace(/\{\{shippingAddress\}\}/g, order.shippingAddress?.address || "")
      .replace(/\{\{shippingCity\}\}/g, order.shippingAddress?.city || "")
      .replace(/\{\{shippingState\}\}/g, order.shippingAddress?.state || "")
      .replace(
        /\{\{shippingPhone\}\}/g,
        order.shippingAddress?.phoneNumber || ""
      );

    // Handle conditional delivery time
    if (deliveryTime) {
      htmlTemplate = htmlTemplate
        .replace(/\{\{#if deliveryTime\}\}/g, "")
        .replace(/\{\{\/if\}\}/g, "")
        .replace(/\{\{deliveryTime\}\}/g, deliveryTime)
        .replace(/\{\{estimatedDelivery\}\}/g, deliveryTime);
    } else {
      // Remove conditional blocks if no delivery time
      htmlTemplate = htmlTemplate.replace(
        /\{\{#if deliveryTime\}\}[\s\S]*?\{\{\/if\}\}/g,
        ""
      );
    }

    const mailOptions = {
      from: `"House of Shirt" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to: order.user?.email || order.guestEmail,
      subject: config.subject,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `Order ${status} email sent to ${order.user?.email || order.guestEmail}`
    );
    return { success: true };
  } catch (error) {
    console.error(`Error sending order ${status} email:`, error);
    return { success: false, error: error.message };
  }
};

export default {
  sendVerificationEmail,
  sendLowStockAlert,
  sendPasswordResetEmail,
  sendOrderStatusEmail,
};
