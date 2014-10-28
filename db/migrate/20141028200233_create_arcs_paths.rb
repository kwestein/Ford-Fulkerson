class CreateArcsPaths < ActiveRecord::Migration
  def change	
  	create_table :arcs_paths, id: false do |t|
      t.belongs_to :path
      t.belongs_to :arc
    end
  end
end
