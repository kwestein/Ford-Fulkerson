class CreateNodes < ActiveRecord::Migration
  def change
    create_table :nodes do |t|
      t.integer :number

      t.timestamps
    end
  end
end
