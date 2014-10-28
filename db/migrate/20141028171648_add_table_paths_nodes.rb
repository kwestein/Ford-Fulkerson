class AddTablePathsNodes < ActiveRecord::Migration
  def change	
  	create_table :nodes_paths, id: false do |t|
      t.belongs_to :path
      t.belongs_to :node
    end
  end
end
