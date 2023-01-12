module.exports = {
  auth: {
    fields: {
      accessToken: {
        api: 'access_token',
      },
      id: {
        api: 'id',
      },
      email: {
        api: 'email',
      },
      password: {
        api: 'password',
      },
      date: {
        api: 'date',
      },
      clientId: {
        api: 'client_id',
      },
      clientSecret: {
        api: 'client_secret',
      },
      type: {
        api: 'type',
      },
      entryType: {
        value: 'entry',
      },
      leaserType: {
        value: 'leaser',
      },
      agentType: {
        value: 'agent',
      },
      adminType: {
        value: 'admin',
      },
      expiresAt: {
        api: 'expires_at',
      },
    },
  },
  entries: {
    table: 'Certifikat data',
    fields: {
      certificateNo: {
        db: 'Certifikat nr.',
      },
      leaserName: {
        db: 'Kunde navn',
      },

      cprCvr: {
        db: 'CPR / CVR',
        api: 'cpr_cvr',
      },
      customerName: {
        db: 'Navn',
        api: 'name',
      },
      customerEmail: {
        db: 'E-mail',
        api: 'email',
      },
      department: {
        db: 'Afdeling',
        api: 'department',
      },
      registrationNumber: {
        db: 'Registreringsnummer',
        api: 'registration_number',
      },
      registrationDate: {
        db: 'Første registreringsdato',
        api: 'date_of_registration',
      },
      vinNumber: {
        db: 'Stelnummer',
        api: 'vin',
      },
      brand: {
        db: 'Mærke',
        api: 'brand',
      },
      model: {
        db: 'Model',
        api: 'model',
      },
      premium: {
        db: 'Forsikringspræmie',
        api: 'insurance_premium',
      },
      excess: {
        db: 'Selvrisiko',
        api: 'insurance_excess',
      },
      estimatedValue: {
        db: 'Køretøjet’s værdi',
        api: 'estimated_value',
      },
      code: {
        db: 'Kode',
        api: 'code',
      },
      partnerReference: {
        db: 'Partner Reference',
        api: 'partner_reference',
      },
      isStill: {
        db: 'Stilstand',
        api: 'status_still',
      },
      needRoadAssistance: {
        db: 'Vejhjælp',
        api: 'roadside_assistance',
      },
      needGlassCoverage: {
        db: 'Glasdækning',
        api: 'glass_coverage',
      },
      remarks: {
        db: 'Bemærkninger',
        api: 'remarks',
      },

      emailSent: {
        db: 'Receipt Sent',
        api: 'receipt_sent',
      },
      isDeleted: {
        db: 'Deleted',
      },
      updatedNumber: {
        db: 'Antal opdateringer',
      },
      lastUpdatedAt: {
        db: 'Sidst opdateret den',
      },

      certificate: {
        db: 'Certifikat',
        api: 'certificate',
      },

      leaser: {
        db: 'Leaser',
      },
      agent: {
        db: 'Agent',
      },
      agentRecordId: {
        db: 'agentId',
        api: 'agent_id',
      },
      leaserRecordId: {
        db: 'leaserId',
        api: 'leaser_id',
      },
      recordId: {
        db: 'entryId',
        api: `entry_id`,
      },

      needReceipt: {
        db: 'Need Receipt Email',
        api: 'need_receipt',
      },

      createdAt: {
        db: 'Created At',
        api: 'created_at',
      },
    },
  },
  agents: {
    table: 'Forsikringsmæglere',
    fields: {
      name: {
        db: 'Name',
        api: 'name',
      },
      email: {
        db: 'Email',
        api: 'email',
      },
      password: {
        db: 'Password',
        api: 'password',
      },
      picture: {
        db: 'Picture',
        api: 'picture',
      },
      logo: {
        db: 'Logo',
        api: 'logo',
      },
      insuranceTerms: {
        db: 'Forsikringsbetingelser',
        api: 'insurance_terms',
      },
      insuranceCompanyEmail: {
        db: 'Insurance Company Email',
        api: 'insurance_company_email',
      },
      terms: {
        db: 'Vilkår',
        api: 'terms',
      },
      guidance: {
        db: 'Vejledning',
        api: 'guidance',
      },
      protector: {
        db: 'Sikring',
        api: 'protector',
      },
      remark: {
        db: 'Bemærkning',
        api: 'remark',
      },
      forbidAccess: {
        db: 'Forbid Access',
      },
      forbidAccessChangeTime: {
        db: 'forbidAccessChangeTime',
        api: 'glass_coverage',
      },
      entriesViewId: {
        db: 'Entries View Id',
        api: 'entries_view_id',
      },
      recordId: {
        db: 'agentId',
        api: `agent_id`,
      },
      areCodesActive: {
        db: 'areCodesActive',
        api: 'areCodesActive',
      },
    },
  },
  leasers: {
    table: 'Kunder',
    fields: {
      name: {
        db: 'Name',
        api: `name`,
      },
      email: {
        db: 'Email',
        api: `email`,
      },
      roadAssistance: {
        db: 'Road Assistance PDF',
        api: `road_assistance_pdf`,
      },
      logo: {
        db: 'Logo',
        api: `logo`,
      },
      policyNumber: {
        db: 'Policy Number',
        api: `policy_number`,
      },
      forbidAccess: {
        db: 'Forbid Access',
        api: 'forbid_access',
      },
      forbidAccessChangeTime: {
        db: 'forbidAccessChangeTime',
      },

      sendEmailAgain: {
        db: 'Send kunder email igen',
      },

      agent: {
        db: 'Agent',
      },

      secret: {
        db: 'secret',
        api: 'forbid_access',
      },

      recordId: {
        db: 'leaserId',
        api: 'leaser_id',
      },

      agentRecordId: {
        db: 'agentId',
        api: 'agent_id',
      },
    },
  },
  numberOfEntries: {
    table: 'Number Of Entries',
    fields: {
      counter: {
        db: 'Last Number',
      },
    },
  },
  codes: {
    table: 'Koder',
    fields: {
      recordId: {
        db: 'codeId',
        api: 'code_id',
      },
      code: {
        db: 'Kode',
        api: 'code',
      },
      minValue: {
        db: 'minVærdi',
        api: 'minValue',
      },
      maxValue: {
        db: 'maxVærdi',
        api: 'maxValue',
      },
      category: {
        db: 'Kategori',
        api: 'Category',
        type: {
          stilstand: 'Stilstand',
          glass: 'Glasdækning',
        },
      },
      value: {
        db: 'Værdi',
        api: 'Value',
      },
      agent: {
        db: 'Mægler',
        api: 'Agent',
      },
    },
  },
};
