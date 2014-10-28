class AddIndices < ActiveRecord::Migration
  def change
  	change_table :paths do |t|
	  t.index :id
	  t.index :max_flow
	end

	change_table :nodes do |t|
	  t.index :id
	  t.index :number
	  t.remove :path_id
	end

	change_table :arcs do |t|
	  t.index :id
	  t.index :flow
  	  t.index :head_id
	  t.index :tail_id
	end

	change_table :arcs_paths do |t|
	  t.index :arc_id
	  t.index :path_id
	end

	change_table :nodes_paths do |t|
	  t.index :node_id
	  t.index :path_id
	end
  end
end
