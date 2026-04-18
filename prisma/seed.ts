/**
 * Seed de démo GL Cuisines.
 * Contexte temporel : avril 2026 (semaine courante ~ S16).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NOMS_ETAPES = [
  "Bon de commande",
  "Plans techniques",
  "Plans de pose",
  "Commandes passées",
  "Livraisons reçues",
  "Dépose",
  "Prépa électrique",
  "Pose",
  "Facturation",
];

async function reset() {
  // Ordre de suppression respectant les FK.
  await prisma.sAVJournal.deleteMany();
  await prisma.sAV.deleteMany();
  await prisma.assignationPoseur.deleteMany();
  await prisma.commande.deleteMany();
  await prisma.etapeProjet.deleteMany();
  await prisma.projet.deleteMany();
  await prisma.client.deleteMany();
  await prisma.fournisseur.deleteMany();
  await prisma.poseur.deleteMany();
  await prisma.vendeur.deleteMany();
}

async function main() {
  await reset();

  // Fournisseurs
  const [snaidero, bosch, silestone, quick, leroy] = await Promise.all([
    prisma.fournisseur.create({
      data: {
        nom: "Snaidero",
        contact: "Julien Martin",
        telephone: "02 98 00 11 22",
        email: "contact@snaidero.fr",
        categories: ["meubles", "accessoires"],
      },
    }),
    prisma.fournisseur.create({
      data: {
        nom: "Bosch",
        contact: "Service pro",
        telephone: "0 800 05 50 50",
        email: "pro@bosch.fr",
        categories: ["electromenagers"],
      },
    }),
    prisma.fournisseur.create({
      data: {
        nom: "Silestone",
        contact: "Agence Ouest",
        telephone: "02 40 00 00 00",
        email: "ouest@silestone.fr",
        categories: ["plan_travail", "credence"],
      },
    }),
    prisma.fournisseur.create({
      data: {
        nom: "Quick Fix",
        contact: "Patricia",
        telephone: "02 98 33 44 55",
        email: "contact@quickfix.fr",
        categories: ["accessoires", "fond_hotte"],
      },
    }),
    prisma.fournisseur.create({
      data: {
        nom: "Leroy Sanitaires",
        contact: "Showroom Brest",
        telephone: "02 98 77 66 55",
        email: "brest@leroy-sanitaires.fr",
        categories: ["sanitaires"],
      },
    }),
  ]);

  // Poseurs
  const [malo, yann] = await Promise.all([
    prisma.poseur.create({
      data: { nom: "Le Gall", prenom: "Malo", telephone: "06 11 22 33 44", interne: true },
    }),
    prisma.poseur.create({
      data: { nom: "Riou", prenom: "Yann", telephone: "06 55 66 77 88", interne: true },
    }),
  ]);

  // Vendeur
  const gildas = await prisma.vendeur.create({
    data: {
      nom: "Gourmelen",
      prenom: "Gildas",
      telephone: "06 12 34 56 78",
      email: "gildas@glcuisines.fr",
    },
  });

  // Clients
  const [durand, tanguy, kerleau] = await Promise.all([
    prisma.client.create({
      data: {
        nom: "Durand",
        prenom: "Catherine",
        telephone: "06 01 02 03 04",
        email: "c.durand@example.fr",
        adresse: "12 rue de Siam",
        codePostal: "29200",
        ville: "Brest",
      },
    }),
    prisma.client.create({
      data: {
        nom: "Tanguy",
        prenom: "Erwan",
        telephone: "06 10 20 30 40",
        email: "e.tanguy@example.fr",
        adresse: "4 place Guérin",
        codePostal: "29200",
        ville: "Brest",
      },
    }),
    prisma.client.create({
      data: {
        nom: "Kerleau",
        prenom: "Soizic",
        telephone: "06 98 76 54 32",
        email: "s.kerleau@example.fr",
        adresse: "18 rue de la Porte",
        codePostal: "29280",
        ville: "Plouzané",
      },
    }),
  ]);

  // Helper : crée les 9 étapes d'un projet avec un scénario donné.
  async function creerEtapes(projetId: string, scenario: "demarre" | "commandes_faites" | "pose_proche") {
    type Statut = "non_commence" | "en_cours" | "termine" | "bloque";
    const statutsParScenario: Record<typeof scenario, Statut[]> = {
      demarre: [
        "termine",        // bon commande
        "en_cours",       // plans techniques
        "non_commence",   // plans de pose
        "non_commence",   // commandes passées
        "non_commence",   // livraisons
        "non_commence",   // dépose
        "non_commence",   // prépa élec
        "non_commence",   // pose
        "non_commence",   // facturation
      ],
      commandes_faites: [
        "termine",
        "termine",
        "termine",
        "termine",
        "en_cours",
        "non_commence",
        "en_cours",
        "non_commence",
        "non_commence",
      ],
      pose_proche: [
        "termine",
        "termine",
        "termine",
        "termine",
        "en_cours",
        "termine",
        "en_cours",
        "non_commence",
        "non_commence",
      ],
    };
    const statuts = statutsParScenario[scenario];
    await Promise.all(
      NOMS_ETAPES.map((nom, i) =>
        prisma.etapeProjet.create({
          data: {
            projetId,
            numero: i + 1,
            nom,
            statut: statuts[i],
          },
        }),
      ),
    );
  }

  // Projet 1 — Durand, pose S18, à risque (commandes essentielles non envoyées).
  const projetDurand = await prisma.projet.create({
    data: {
      reference: "2026-011",
      clientId: durand.id,
      vendeurId: gildas.id,
      typeProjet: "cuisine",
      adresseChantier: "12 rue de Siam",
      codePostalChantier: "29200",
      villeChantier: "Brest",
      montantHT: 24500,
      montantTTC: 29400,
      semainePose: "S18",
      anneePose: 2026,
      estRenovation: true,
      dateSignature: new Date("2026-02-14"),
    },
  });
  await creerEtapes(projetDurand.id, "demarre");
  await Promise.all([
    prisma.commande.create({
      data: {
        projetId: projetDurand.id,
        fournisseurId: snaidero.id,
        categorie: "meubles",
        statutCommande: "non_envoye",
        semaineLivraisonPrevue: "S17",
        statutLivraison: "en_attente",
        essentielle: true,
        remarque: "Attente finition coloris",
      },
    }),
    prisma.commande.create({
      data: {
        projetId: projetDurand.id,
        fournisseurId: bosch.id,
        categorie: "electromenagers",
        statutCommande: "confirme",
        semaineLivraisonPrevue: "S17",
        statutLivraison: "en_attente",
        essentielle: true,
      },
    }),
    prisma.commande.create({
      data: {
        projetId: projetDurand.id,
        fournisseurId: silestone.id,
        categorie: "plan_travail",
        statutCommande: "envoye",
        semaineLivraisonPrevue: "S18",
        statutLivraison: "en_attente",
        essentielle: true,
      },
    }),
  ]);
  await prisma.assignationPoseur.create({
    data: { projetId: projetDurand.id, poseurId: malo.id, semaine: "S18", annee: 2026, role: "principal" },
  });

  // Projet 2 — Tanguy, pose S23, vigilance (reliquat sur catégorie essentielle).
  const projetTanguy = await prisma.projet.create({
    data: {
      reference: "2026-018",
      clientId: tanguy.id,
      vendeurId: gildas.id,
      typeProjet: "cuisine",
      adresseChantier: "4 place Guérin",
      codePostalChantier: "29200",
      villeChantier: "Brest",
      montantHT: 32000,
      montantTTC: 38400,
      semainePose: "S23",
      anneePose: 2026,
      estRenovation: false,
      dateSignature: new Date("2026-03-02"),
    },
  });
  await creerEtapes(projetTanguy.id, "commandes_faites");
  await Promise.all([
    prisma.commande.create({
      data: {
        projetId: projetTanguy.id,
        fournisseurId: snaidero.id,
        categorie: "meubles",
        statutCommande: "reliquat",
        semaineLivraisonPrevue: "S20",
        statutLivraison: "partiel",
        essentielle: true,
        remarque: "Manque 2 caissons hauts",
      },
    }),
    prisma.commande.create({
      data: {
        projetId: projetTanguy.id,
        fournisseurId: bosch.id,
        categorie: "electromenagers",
        statutCommande: "livre",
        semaineLivraisonPrevue: "S18",
        statutLivraison: "livre",
        essentielle: true,
      },
    }),
    prisma.commande.create({
      data: {
        projetId: projetTanguy.id,
        fournisseurId: quick.id,
        categorie: "accessoires",
        statutCommande: "confirme",
        semaineLivraisonPrevue: "S21",
        statutLivraison: "en_attente",
        essentielle: false,
      },
    }),
  ]);
  await prisma.assignationPoseur.create({
    data: { projetId: projetTanguy.id, poseurId: yann.id, semaine: "S23", annee: 2026, role: "principal" },
  });

  // Projet 3 — Kerleau, pose S16 (cette semaine), prêt.
  const projetKerleau = await prisma.projet.create({
    data: {
      reference: "2026-005",
      clientId: kerleau.id,
      vendeurId: gildas.id,
      typeProjet: "cuisine",
      adresseChantier: "18 rue de la Porte",
      codePostalChantier: "29280",
      villeChantier: "Plouzané",
      montantHT: 18500,
      montantTTC: 22200,
      semainePose: "S16",
      anneePose: 2026,
      estRenovation: true,
      dateSignature: new Date("2026-01-18"),
    },
  });
  await creerEtapes(projetKerleau.id, "pose_proche");
  await Promise.all([
    prisma.commande.create({
      data: {
        projetId: projetKerleau.id,
        fournisseurId: snaidero.id,
        categorie: "meubles",
        statutCommande: "livre",
        semaineLivraisonPrevue: "S14",
        statutLivraison: "livre",
        essentielle: true,
      },
    }),
    prisma.commande.create({
      data: {
        projetId: projetKerleau.id,
        fournisseurId: bosch.id,
        categorie: "electromenagers",
        statutCommande: "livre",
        semaineLivraisonPrevue: "S15",
        statutLivraison: "livre",
        essentielle: true,
      },
    }),
    prisma.commande.create({
      data: {
        projetId: projetKerleau.id,
        fournisseurId: silestone.id,
        categorie: "plan_travail",
        statutCommande: "expedie",
        semaineLivraisonPrevue: "S16",
        statutLivraison: "retard",
        essentielle: true,
        remarque: "Camion bloqué – livraison décalée de 2j",
      },
    }),
    prisma.commande.create({
      data: {
        projetId: projetKerleau.id,
        fournisseurId: leroy.id,
        categorie: "sanitaires",
        statutCommande: "livre",
        semaineLivraisonPrevue: "S15",
        statutLivraison: "livre",
        essentielle: false,
      },
    }),
  ]);
  await prisma.assignationPoseur.createMany({
    data: [
      { projetId: projetKerleau.id, poseurId: malo.id, semaine: "S16", annee: 2026, role: "principal" },
      { projetId: projetKerleau.id, poseurId: yann.id, semaine: "S16", annee: 2026, role: "secondaire" },
    ],
  });

  // SAV — ticket ouvert bloquant sur projet Tanguy (livraison Snaidero partielle).
  const savTanguy = await prisma.sAV.create({
    data: {
      projetId: projetTanguy.id,
      fournisseurId: snaidero.id,
      categorie: "meubles",
      typeProbleme: "Caissons hauts manquants sur livraison partielle",
      statut: "en_attente_fournisseur",
      bloquant: true,
      dateOuverture: new Date("2026-04-02"),
      commentaire: "Snaidero s'engage à livrer les caissons manquants S20.",
    },
  });
  await prisma.sAVJournal.createMany({
    data: [
      {
        savId: savTanguy.id,
        type: "creation",
        auteur: "Gildas",
        commentaire: "Ticket ouvert suite livraison partielle.",
        horodatage: new Date("2026-04-02T09:30:00"),
      },
      {
        savId: savTanguy.id,
        type: "note",
        auteur: "Gildas",
        commentaire: "Relance téléphonique — engagement livraison S20.",
        horodatage: new Date("2026-04-08T14:15:00"),
      },
    ],
  });

  console.log("✅ Seed terminé : 3 projets, 5 fournisseurs, 2 poseurs, 1 SAV.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
