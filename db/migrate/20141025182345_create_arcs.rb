class CreateArcs < ActiveRecord::Migration
  def change
    create_table :arcs do |t|

      t.timestamps
    end
  end
end
