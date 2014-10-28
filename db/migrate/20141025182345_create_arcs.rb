class CreateArcs < ActiveRecord::Migration
  def change
    create_table :arcs do |t|
      t.integer :flow
      t.integer :initial_flow
      t.integer :head_id
      t.integer :tail_id

      t.timestamps
    end
  end
end
