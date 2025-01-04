import nodemailer from 'nodemailer'

export const sendApprovalEmails = async (students, pfa) => {
  try {
    // Configurer le transporteur d'emails avec Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Envoyer un email à chaque étudiant avec son nom et projet
    for (const student of students) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: `Votre choix PFA a été approuvé`,
        html: generateApprovalEmailTemplate(student.firstName, student.lastName, pfa.title),
      };

      // Envoi de l'email
      await transporter.sendMail(mailOptions);
      console.log(`Email envoyé avec succès à ${student.email}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi des emails : ", error.message);
  }
};

// Fonction pour générer le contenu HTML de l'email
const generateApprovalEmailTemplate = (firstName, lastName, projectTitle) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
      body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f9;
          color: #333;
      }
      .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
          background-color: #0078d7;
          color: #fff;
          text-align: center;
          padding: 20px;
      }
      .header h1 {
          margin: 0;
          font-size: 1.8rem;
      }
      .content {
          padding: 20px;
          text-align: left;
      }
      .content p {
          margin: 0 0 15px;
          line-height: 1.6;
      }
      .content .highlight {
          color: #0078d7;
          font-weight: bold;
      }
      .footer {
          background-color: #f4f4f9;
          text-align: center;
          padding: 15px;
          font-size: 0.9rem;
          color: #666;
      }
      .footer img {
          display: block;
          margin: 10px auto;
          width: 65px;
          height: 50px;
      }
      .footer p {
          margin: 5px 0;
      }
    .black {
      color: #000;
    }
  </style>
</head>
<body>
  <div class="email-container">
      <div class="header">
          <h1>Votre choix PFA a été approuvé</h1>
      </div>
      <div class="content">
          <p class="black">Bonjour ${firstName} ${lastName},</p>
          <p>Félicitations ! Votre choix pour le projet suivant a été approuvé :</p>
          <p class="highlight">"${projectTitle}"</p>
          <p>Vous êtes désormais affecté à ce projet. Nous vous souhaitons bonne chance pour cette étape importante !</p>
          <p>Cordialement,</p>
          <hr>
          <p class="black">L'équipe du système de gestion des pfas de l'ISAMM - <span style="font-size: 0.7rem; color: #666;">${new Date().toLocaleDateString()}</span></p>
      </div>
      <div class="footer">
          <img src="https://isa2m.rnu.tn/assets/img/logo-dark.png" alt="ISAMM Logo">
          <p>&copy; ISAMM PFA Management System</p>
      </div>
  </div>
</body>
</html>`;
