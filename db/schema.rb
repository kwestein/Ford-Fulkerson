# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20141028221049) do

  create_table "arcs", force: true do |t|
    t.integer  "flow"
    t.integer  "initial_flow"
    t.integer  "head_id"
    t.integer  "tail_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "arcs", ["flow"], name: "index_arcs_on_flow", using: :btree
  add_index "arcs", ["head_id"], name: "index_arcs_on_head_id", using: :btree
  add_index "arcs", ["id"], name: "index_arcs_on_id", using: :btree
  add_index "arcs", ["tail_id"], name: "index_arcs_on_tail_id", using: :btree

  create_table "arcs_paths", id: false, force: true do |t|
    t.integer "path_id"
    t.integer "arc_id"
  end

  add_index "arcs_paths", ["arc_id"], name: "index_arcs_paths_on_arc_id", using: :btree
  add_index "arcs_paths", ["path_id"], name: "index_arcs_paths_on_path_id", using: :btree

  create_table "nodes", force: true do |t|
    t.integer  "number"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "nodes", ["id"], name: "index_nodes_on_id", using: :btree
  add_index "nodes", ["number"], name: "index_nodes_on_number", using: :btree

  create_table "nodes_paths", id: false, force: true do |t|
    t.integer "path_id"
    t.integer "node_id"
  end

  add_index "nodes_paths", ["node_id"], name: "index_nodes_paths_on_node_id", using: :btree
  add_index "nodes_paths", ["path_id"], name: "index_nodes_paths_on_path_id", using: :btree

  create_table "paths", force: true do |t|
    t.integer  "max_flow"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "paths", ["id"], name: "index_paths_on_id", using: :btree
  add_index "paths", ["max_flow"], name: "index_paths_on_max_flow", using: :btree

end
