class OrgOption {
  constructor(id, name) {
    this.name = name;
    this.id = id;
  }

  static fromOption(option) {
    return new OrgOption(option.value, option.label);
  }

  static fromRecord(record) {
    return new OrgOption(record.id, record.name);
  }

  toOption() {
    return {
      label: this.name,
      value: this.id,
    };
  }

  toRecord() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}

export default OrgOption;
