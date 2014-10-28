class CreatePaths < ActiveRecord::Migration
  def change
    create_table :paths do |t|
      t.integer :max_flow

      t.timestamps
    end
  end
end
