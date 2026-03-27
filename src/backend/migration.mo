module {
  type OldActor = {};
  type NewActor = {
    // Extend with new fields and types.
  };

  public func run(old : OldActor) : NewActor {
    {
      // Map old state to new state, copying over unchanged fields.
    };
  };
};
