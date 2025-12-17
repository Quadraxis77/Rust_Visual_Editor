// Workflow Documentation for Blockly Editor

// Embedded examples
const examples = {
    "01_rust_basics": {
        title: "Rust Basics",
        description: "Simple function with main",
        mode: "rust",
        difficulty: "beginner",
        xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <comment pinned="true" h="80" w="400" x="20" y="20">Example 1: Rust Basics
Demonstrates:
- Function definition with parameters
- Variable declarations
- Basic math operations
- Return values</comment>
  
  <block type="file_container" x="20" y="120">
    <field name="FILENAME">main.rs</field>
    <statement name="CONTENTS">
      <block type="rust_pub_function">
        <field name="NAME">add_numbers</field>
        <value name="PARAMS">
          <block type="rust_parameters">
            <field name="PARAMS">a: i32, b: i32</field>
          </block>
        </value>
        <value name="RETURN_TYPE">
          <block type="rust_return_type">
            <field name="TYPE">i32</field>
          </block>
        </value>
        <statement name="BODY">
          <block type="rust_return">
            <value name="VALUE">
              <block type="rust_binary_op">
                <field name="OP">ADD</field>
                <value name="LEFT">
                  <block type="rust_var">
                    <field name="NAME">a</field>
                  </block>
                </value>
                <value name="RIGHT">
                  <block type="rust_var">
                    <field name="NAME">b</field>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </statement>
        <next>
          <block type="rust_main">
            <statement name="BODY">
              <block type="rust_let">
                <field name="MUTABLE">FALSE</field>
                <field name="NAME">result</field>
                <value name="VALUE">
                  <block type="rust_call">
                    <mutation args="2"></mutation>
                    <field name="FUNCTION">add_numbers</field>
                    <value name="ARG0">
                      <block type="rust_number">
                        <field name="VALUE">10</field>
                      </block>
                    </value>
                    <value name="ARG1">
                      <block type="rust_number">
                        <field name="VALUE">20</field>
                      </block>
                    </value>
                  </block>
                </value>
                <next>
                  <block type="rust_expr_stmt">
                    <value name="EXPR">
                      <block type="rust_call">
                        <mutation args="2"></mutation>
                        <field name="FUNCTION">println!</field>
                        <value name="ARG0">
                          <block type="rust_string">
                            <field name="VALUE">Result: {}</field>
                          </block>
                        </value>
                        <value name="ARG1">
                          <block type="rust_var">
                            <field name="NAME">result</field>
                          </block>
                        </value>
                      </block>
                    </value>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`
    },
    "02_wgsl_shader": {
        title: "WGSL Shader",
        description: "GPU compute shader",
        mode: "wgsl",
        difficulty: "intermediate",
        xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <comment pinned="true" h="80" w="400" x="20" y="20">Example 2: WGSL Compute Shader
Demonstrates:
- Struct definition
- Storage buffer binding
- Compute shader with workgroup
- GPU parallel processing</comment>
  
  <block type="file_container" x="20" y="120">
    <field name="FILENAME">compute.wgsl</field>
    <statement name="CONTENTS">
      <block type="wgsl_struct">
        <field name="NAME">Data</field>
        <statement name="FIELDS">
          <block type="wgsl_struct_field">
            <field name="NAME">value</field>
            <field name="TYPE">f32</field>
            <next>
              <block type="wgsl_struct_field">
                <field name="NAME">multiplier</field>
                <field name="TYPE">f32</field>
              </block>
            </next>
          </block>
        </statement>
        <next>
          <block type="wgsl_storage_buffer_full">
            <field name="GROUP">0</field>
            <field name="BINDING">0</field>
            <field name="ACCESS">read_write</field>
            <field name="NAME">data</field>
            <field name="TYPE">array&lt;Data&gt;</field>
            <next>
              <block type="wgsl_compute_shader_full">
                <field name="X">64</field>
                <field name="Y">1</field>
                <field name="Z">1</field>
                <field name="NAME">process_data</field>
                <value name="PARAMS">
                  <block type="wgsl_struct_field_builtin">
                    <field name="BUILTIN">global_invocation_id</field>
                    <field name="NAME">global_id</field>
                    <field name="TYPE">vec3&lt;u32&gt;</field>
                  </block>
                </value>
                <statement name="BODY">
                  <block type="wgsl_let">
                    <field name="NAME">index</field>
                    <value name="VALUE">
                      <block type="wgsl_field_access">
                        <field name="FIELD">x</field>
                        <value name="OBJECT">
                          <block type="wgsl_var_ref">
                            <field name="NAME">global_id</field>
                          </block>
                        </value>
                      </block>
                    </value>
                    <next>
                      <block type="wgsl_if">
                        <value name="CONDITION">
                          <block type="wgsl_binary_op">
                            <field name="OP">LT</field>
                            <value name="LEFT">
                              <block type="wgsl_var_ref">
                                <field name="NAME">index</field>
                              </block>
                            </value>
                            <value name="RIGHT">
                              <block type="wgsl_array_length">
                                <value name="ARRAY">
                                  <block type="wgsl_var_ref">
                                    <field name="NAME">data</field>
                                  </block>
                                </value>
                              </block>
                            </value>
                          </block>
                        </value>
                        <statement name="THEN">
                          <block type="wgsl_compound_assign">
                            <field name="OP">*=</field>
                            <value name="TARGET">
                              <block type="wgsl_field_access">
                                <field name="FIELD">value</field>
                                <value name="OBJECT">
                                  <block type="wgsl_index">
                                    <value name="ARRAY">
                                      <block type="wgsl_var_ref">
                                        <field name="NAME">data</field>
                                      </block>
                                    </value>
                                    <value name="INDEX">
                                      <block type="wgsl_var_ref">
                                        <field name="NAME">index</field>
                                      </block>
                                    </value>
                                  </block>
                                </value>
                              </block>
                            </value>
                            <value name="VALUE">
                              <block type="wgsl_field_access">
                                <field name="FIELD">multiplier</field>
                                <value name="OBJECT">
                                  <block type="wgsl_index">
                                    <value name="ARRAY">
                                      <block type="wgsl_var_ref">
                                        <field name="NAME">data</field>
                                      </block>
                                    </value>
                                    <value name="INDEX">
                                      <block type="wgsl_var_ref">
                                        <field name="NAME">index</field>
                                      </block>
                                    </value>
                                  </block>
                                </value>
                              </block>
                            </value>
                          </block>
                        </statement>
                      </block>
                    </next>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`
    },
    "03_bevy_system": {
        title: "Bevy System",
        description: "ECS with components",
        mode: "bevy",
        difficulty: "intermediate",
        xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <comment pinned="true" h="80" w="400" x="20" y="20">Example 3: Bevy ECS System
Demonstrates:
- Component definition
- ECS system with Query
- Iterating over entities
- Modifying components</comment>
  
  <block type="file_container" x="20" y="120">
    <field name="FILENAME">game.rs</field>
    <statement name="CONTENTS">
      <block type="rust_struct">
        <field name="VISIBILITY">PUB</field>
        <field name="NAME">Position</field>
        <field name="DERIVES">Component, Debug</field>
        <statement name="FIELDS">
          <block type="rust_field">
            <field name="NAME">x</field>
            <field name="TYPE">f32</field>
            <next>
              <block type="rust_field">
                <field name="NAME">y</field>
                <field name="TYPE">f32</field>
              </block>
            </next>
          </block>
        </statement>
        <next>
          <block type="rust_struct">
            <field name="VISIBILITY">PUB</field>
            <field name="NAME">Velocity</field>
            <field name="DERIVES">Component, Debug</field>
            <statement name="FIELDS">
              <block type="rust_field">
                <field name="NAME">x</field>
                <field name="TYPE">f32</field>
                <next>
                  <block type="rust_field">
                    <field name="NAME">y</field>
                    <field name="TYPE">f32</field>
                  </block>
                </next>
              </block>
            </statement>
            <next>
              <block type="bevy_system">
                <field name="NAME">movement_system</field>
                <value name="PARAMS">
                  <block type="bevy_query">
                    <value name="COMPONENTS">
                      <block type="bevy_query_components">
                        <field name="COMPONENTS">&amp;mut Position, &amp;Velocity</field>
                      </block>
                    </value>
                  </block>
                </value>
                <statement name="BODY">
                  <block type="rust_for_iter">
                    <field name="VAR">(mut pos, vel)</field>
                    <value name="ITER">
                      <block type="bevy_query_iter_mut">
                        <value name="QUERY">
                          <block type="rust_var">
                            <field name="NAME">query</field>
                          </block>
                        </value>
                      </block>
                    </value>
                    <statement name="BODY">
                      <block type="rust_compound_assign">
                        <field name="OP">ADD</field>
                        <value name="TARGET">
                          <block type="rust_field_access">
                            <field name="FIELD">x</field>
                            <value name="OBJECT">
                              <block type="rust_var">
                                <field name="NAME">pos</field>
                              </block>
                            </value>
                          </block>
                        </value>
                        <value name="VALUE">
                          <block type="rust_field_access">
                            <field name="FIELD">x</field>
                            <value name="OBJECT">
                              <block type="rust_var">
                                <field name="NAME">vel</field>
                              </block>
                            </value>
                          </block>
                        </value>
                        <next>
                          <block type="rust_compound_assign">
                            <field name="OP">ADD</field>
                            <value name="TARGET">
                              <block type="rust_field_access">
                                <field name="FIELD">y</field>
                                <value name="OBJECT">
                                  <block type="rust_var">
                                    <field name="NAME">pos</field>
                                  </block>
                                </value>
                              </block>
                            </value>
                            <value name="VALUE">
                              <block type="rust_field_access">
                                <field name="FIELD">y</field>
                                <value name="OBJECT">
                                  <block type="rust_var">
                                    <field name="NAME">vel</field>
                                  </block>
                                </value>
                              </block>
                            </value>
                          </block>
                        </next>
                      </block>
                    </statement>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`
    },
    "04_mixed_mode": {
        title: "Mixed Mode",
        description: "Rust + WGSL integration",
        mode: "mixed",
        difficulty: "advanced",
        xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <comment pinned="true" h="100" w="500" x="20" y="20">Example 4: Mixed Mode (Rust + WGSL + Bevy)
Demonstrates:
- Shared struct definition between Rust and WGSL
- GPU compute shader for physics
- Bevy system to manage GPU resources
- Cross-mode type compatibility</comment>
  
  <block type="file_container" x="20" y="140">
    <field name="FILENAME">physics.wgsl</field>
    <statement name="CONTENTS">
      <block type="wgsl_struct">
        <field name="NAME">Particle</field>
        <statement name="FIELDS">
          <block type="wgsl_struct_field">
            <field name="NAME">position</field>
            <field name="TYPE">vec3&lt;f32&gt;</field>
            <next>
              <block type="wgsl_struct_field">
                <field name="NAME">velocity</field>
                <field name="TYPE">vec3&lt;f32&gt;</field>
                <next>
                  <block type="wgsl_struct_field">
                    <field name="NAME">_padding</field>
                    <field name="TYPE">f32</field>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
        <next>
          <block type="wgsl_storage_buffer_full">
            <field name="GROUP">0</field>
            <field name="BINDING">0</field>
            <field name="ACCESS">read_write</field>
            <field name="NAME">particles</field>
            <field name="TYPE">array&lt;Particle&gt;</field>
            <next>
              <block type="wgsl_uniform_buffer_full">
                <field name="GROUP">0</field>
                <field name="BINDING">1</field>
                <field name="NAME">delta_time</field>
                <field name="TYPE">f32</field>
                <next>
                  <block type="wgsl_compute_shader_full">
                    <field name="X">64</field>
                    <field name="Y">1</field>
                    <field name="Z">1</field>
                    <field name="NAME">update_particles</field>
                    <value name="PARAMS">
                      <block type="wgsl_struct_field_builtin">
                        <field name="BUILTIN">global_invocation_id</field>
                        <field name="NAME">global_id</field>
                        <field name="TYPE">vec3&lt;u32&gt;</field>
                      </block>
                    </value>
                    <statement name="BODY">
                      <block type="wgsl_let">
                        <field name="NAME">index</field>
                        <value name="VALUE">
                          <block type="wgsl_field_access">
                            <field name="FIELD">x</field>
                            <value name="OBJECT">
                              <block type="wgsl_var_ref">
                                <field name="NAME">global_id</field>
                              </block>
                            </value>
                          </block>
                        </value>
                        <next>
                          <block type="wgsl_if">
                            <value name="CONDITION">
                              <block type="wgsl_binary_op">
                                <field name="OP">LT</field>
                                <value name="LEFT">
                                  <block type="wgsl_var_ref">
                                    <field name="NAME">index</field>
                                  </block>
                                </value>
                                <value name="RIGHT">
                                  <block type="wgsl_array_length">
                                    <value name="ARRAY">
                                      <block type="wgsl_var_ref">
                                        <field name="NAME">particles</field>
                                      </block>
                                    </value>
                                  </block>
                                </value>
                              </block>
                            </value>
                            <statement name="THEN">
                              <block type="wgsl_compound_assign">
                                <field name="OP">+=</field>
                                <value name="TARGET">
                                  <block type="wgsl_field_access">
                                    <field name="FIELD">position</field>
                                    <value name="OBJECT">
                                      <block type="wgsl_index">
                                        <value name="ARRAY">
                                          <block type="wgsl_var_ref">
                                            <field name="NAME">particles</field>
                                          </block>
                                        </value>
                                        <value name="INDEX">
                                          <block type="wgsl_var_ref">
                                            <field name="NAME">index</field>
                                          </block>
                                        </value>
                                      </block>
                                    </value>
                                  </block>
                                </value>
                                <value name="VALUE">
                                  <block type="wgsl_binary_op">
                                    <field name="OP">MUL</field>
                                    <value name="LEFT">
                                      <block type="wgsl_field_access">
                                        <field name="FIELD">velocity</field>
                                        <value name="OBJECT">
                                          <block type="wgsl_index">
                                            <value name="ARRAY">
                                              <block type="wgsl_var_ref">
                                                <field name="NAME">particles</field>
                                              </block>
                                            </value>
                                            <value name="INDEX">
                                              <block type="wgsl_var_ref">
                                                <field name="NAME">index</field>
                                              </block>
                                            </value>
                                          </block>
                                        </value>
                                      </block>
                                    </value>
                                    <value name="RIGHT">
                                      <block type="wgsl_var_ref">
                                        <field name="NAME">delta_time</field>
                                      </block>
                                    </value>
                                  </block>
                                </value>
                              </block>
                            </statement>
                          </block>
                        </next>
                      </block>
                    </statement>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
  
  <block type="file_container" x="600" y="140">
    <field name="FILENAME">particle_system.rs</field>
    <statement name="CONTENTS">
      <block type="rust_struct">
        <field name="VISIBILITY">PUB</field>
        <field name="NAME">Particle</field>
        <field name="DERIVES">Component, Debug</field>
        <statement name="FIELDS">
          <block type="rust_field">
            <field name="NAME">position</field>
            <field name="TYPE">Vec3</field>
            <next>
              <block type="rust_field">
                <field name="NAME">velocity</field>
                <field name="TYPE">Vec3</field>
                <next>
                  <block type="rust_field">
                    <field name="NAME">_padding</field>
                    <field name="TYPE">f32</field>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
        <next>
          <block type="bevy_system">
            <field name="NAME">spawn_particles</field>
            <value name="PARAMS">
              <block type="bevy_commands"></block>
            </value>
            <statement name="BODY">
              <block type="rust_expr_stmt">
                <value name="EXPR">
                  <block type="rust_call">
                    <field name="FUNCTION">println!</field>
                    <value name="ARGS">
                      <block type="rust_string">
                        <field name="VALUE">"Spawning particles for GPU processing"</field>
                      </block>
                    </value>
                  </block>
                </value>
              </block>
            </statement>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`
    },
    "05_linked_files": {
        title: "Linked Files",
        description: "Multi-file project with module linking",
        mode: "rust",
        difficulty: "intermediate",
        xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <comment pinned="true" h="100" w="450" x="20" y="20">Example 5: Linked Files
Demonstrates:
- Multi-file project structure
- Module linking with mod declarations
- Importing items with use statements
- Public APIs with pub keyword
- Visual connection lines between files</comment>
  
  <block type="file_container" x="50" y="150">
    <field name="FILENAME">main.rs</field>
    <statement name="CONTENTS">
      <block type="rust_mod_file">
        <field name="NAME">utils</field>
        <next>
          <block type="rust_mod_file">
            <field name="NAME">config</field>
            <next>
              <block type="rust_use">
                <field name="PATH">utils::calculate</field>
                <next>
                  <block type="rust_use">
                    <field name="PATH">config::Settings</field>
                    <next>
                      <block type="rust_main">
                        <statement name="BODY">
                          <block type="rust_let">
                            <field name="MUTABLE">FALSE</field>
                            <field name="NAME">result</field>
                            <value name="VALUE">
                              <block type="rust_call">
                                <mutation args="1"></mutation>
                                <field name="FUNCTION">calculate</field>
                                <value name="ARG0">
                                  <block type="rust_number">
                                    <field name="VALUE">10</field>
                                  </block>
                                </value>
                              </block>
                            </value>
                            <next>
                              <block type="rust_expr_stmt">
                                <value name="EXPR">
                                  <block type="rust_call">
                                    <mutation args="2"></mutation>
                                    <field name="FUNCTION">println!</field>
                                    <value name="ARG0">
                                      <block type="rust_string">
                                        <field name="VALUE">Result: {}</field>
                                      </block>
                                    </value>
                                    <value name="ARG1">
                                      <block type="rust_var">
                                        <field name="NAME">result</field>
                                      </block>
                                    </value>
                                  </block>
                                </value>
                              </block>
                            </next>
                          </block>
                        </statement>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
  
  <block type="file_container" x="550" y="150">
    <field name="FILENAME">utils.rs</field>
    <statement name="CONTENTS">
      <block type="rust_pub_function">
        <field name="NAME">calculate</field>
        <value name="PARAMS">
          <block type="rust_parameters">
            <field name="PARAMS">x: i32</field>
          </block>
        </value>
        <value name="RETURN_TYPE">
          <block type="rust_return_type">
            <field name="TYPE">i32</field>
          </block>
        </value>
        <statement name="BODY">
          <block type="rust_return">
            <value name="VALUE">
              <block type="rust_binary_op">
                <field name="OP">MUL</field>
                <value name="LEFT">
                  <block type="rust_var">
                    <field name="NAME">x</field>
                  </block>
                </value>
                <value name="RIGHT">
                  <block type="rust_number">
                    <field name="VALUE">2</field>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </statement>
      </block>
    </statement>
  </block>
  
  <block type="file_container" x="1050" y="150">
    <field name="FILENAME">config.rs</field>
    <statement name="CONTENTS">
      <block type="rust_struct">
        <field name="NAME">Settings</field>
        <field name="VISIBILITY">pub</field>
        <statement name="FIELDS">
          <block type="rust_field">
            <field name="NAME">debug</field>
            <field name="TYPE">bool</field>
            <field name="VISIBILITY">pub</field>
            <next>
              <block type="rust_field">
                <field name="NAME">port</field>
                <field name="TYPE">u16</field>
                <field name="VISIBILITY">pub</field>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`
    }
};

const workflows = {
    "rust_basics": {
        title: "Rust Mode: Building Functions",
        description: "Learn how to create standalone Rust programs with functions, variables, and control flow",
        steps: [
            {
                title: "1. Start with File Container",
                description: "Every Rust program needs a file container",
                blocks: ["file_container"],
                example: `Drag a "File Container" block and set filename to "main.rs"
All your code blocks go inside this container.`
            },
            {
                title: "2. Add a Main Function",
                description: "Standalone Rust programs need a main() function as entry point",
                blocks: ["rust_main"],
                example: `pub fn main() {
    // Your code here
}`
            },
            {
                title: "3. Define Functions",
                description: "Create reusable functions with parameters and return types",
                blocks: ["rust_pub_function", "rust_parameters", "rust_return_type"],
                example: `pub fn add_numbers(a: i32, b: i32) -> i32 {
    return a + b;
}`
            },
            {
                title: "4. Use Variables",
                description: "Declare variables with let statements",
                blocks: ["rust_let", "rust_var"],
                example: `let result = add_numbers(10, 20);
println!("Result: {}", result);`
            },
            {
                title: "5. Check Your Code",
                description: "Click 'Check Code' to validate and compile",
                blocks: [],
                example: `The auto-import system will add necessary imports.
For standalone Rust, it provides type definitions.
For Bevy code, it adds 'use bevy::prelude::*;'`
            }
        ]
    },
    
    "wgsl_shaders": {
        title: "WGSL Mode: GPU Compute Shaders",
        description: "Learn how to create GPU compute shaders for parallel processing",
        steps: [
            {
                title: "1. Start with File Container",
                description: "Create a .wgsl file for your shader",
                blocks: ["file_container"],
                example: `Set filename to "compute.wgsl"
WGSL shaders don't need imports - all types are built-in.`
            },
            {
                title: "2. Define Data Structures",
                description: "Create structs for your GPU data",
                blocks: ["wgsl_struct", "wgsl_struct_field"],
                example: `struct Particle {
    position: vec3<f32>,
    velocity: vec3<f32>,
    mass: f32,
}`
            },
            {
                title: "3. Add Storage Buffers",
                description: "Declare GPU memory buffers",
                blocks: ["wgsl_storage_buffer_full"],
                example: `@group(0) @binding(0)
var<storage, read_write> particles: array<Particle>;`
            },
            {
                title: "4. Create Compute Shader",
                description: "Define the parallel processing function",
                blocks: ["wgsl_compute_shader_full"],
                example: `@compute @workgroup_size(64)
fn update(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;
    // Process particles[index] in parallel
}`
            },
            {
                title: "5. Add Processing Logic",
                description: "Implement your algorithm inside the shader",
                blocks: ["wgsl_if", "wgsl_compound_assign", "wgsl_binary_op"],
                example: `if (index < arrayLength(&particles)) {
    particles[index].position += particles[index].velocity * dt;
}`
            }
        ]
    },
    
    "bevy_systems": {
        title: "Bevy Mode: ECS Systems",
        description: "Learn how to create Bevy ECS systems with components and queries",
        steps: [
            {
                title: "1. Start with File Container",
                description: "Create a .rs file for your Bevy code",
                blocks: ["file_container"],
                example: `Set filename to "systems.rs"
Bevy imports are added automatically!`
            },
            {
                title: "2. Define Components",
                description: "Create component structs to store data",
                blocks: ["rust_struct"],
                example: `#[derive(Component, Debug)]
pub struct Position {
    pub x: f32,
    pub y: f32,
}

Add 'Component' to the derives field!`
            },
            {
                title: "3. Create a System",
                description: "Systems are functions that process entities",
                blocks: ["bevy_system", "bevy_query"],
                example: `pub fn movement_system(
    mut query: Query<(&mut Position, &Velocity)>
) {
    // System logic here
}`
            },
            {
                title: "4. Query Entities",
                description: "Use Query to access entities with specific components",
                blocks: ["bevy_query_iter_mut", "rust_for_iter"],
                example: `for (mut pos, vel) in query.iter_mut() {
    pos.x += vel.x;
    pos.y += vel.y;
}`
            },
            {
                title: "5. No Main Needed",
                description: "Bevy systems are called by the engine",
                blocks: [],
                example: `Systems don't need a main() function.
They're registered with the Bevy App and called automatically.`
            }
        ]
    },
    
    "mixed_mode_gpu": {
        title: "Mixed Mode: Rust + WGSL Integration",
        description: "Learn how to combine Rust/Bevy code with GPU compute shaders",
        steps: [
            {
                title: "1. Define Matching Structs",
                description: "Create the same struct in both Rust and WGSL",
                blocks: ["rust_struct", "wgsl_struct"],
                example: `Rust:
#[derive(Component)]
pub struct Particle {
    pub position: Vec3,
    pub velocity: Vec3,
    pub _padding: f32,  // Important for alignment!
}

WGSL:
struct Particle {
    position: vec3<f32>,
    velocity: vec3<f32>,
    _padding: f32,
}`
            },
            {
                title: "2. Mind the Alignment",
                description: "GPU memory has strict alignment rules",
                blocks: [],
                example: `vec3<f32> has 16-byte alignment but only 12 bytes size!
Add padding fields to match GPU layout.

Click 'Check Code' to validate alignment automatically.`
            },
            {
                title: "3. Create WGSL Shader",
                description: "Build your GPU compute shader",
                blocks: ["wgsl_compute_shader_full", "wgsl_storage_buffer_full"],
                example: `@group(0) @binding(0)
var<storage, read_write> particles: array<Particle>;

@compute @workgroup_size(64)
fn update(@builtin(global_invocation_id) id: vec3<u32>) {
    // GPU processing
}`
            },
            {
                title: "4. Create Bevy System",
                description: "Manage GPU resources from Rust",
                blocks: ["bevy_system", "bevy_commands"],
                example: `pub fn gpu_physics_system(
    mut commands: Commands
) {
    // Dispatch compute shader
    // Update GPU buffers
}`
            },
            {
                title: "5. Validate Alignment",
                description: "Use the cross-mode validator",
                blocks: [],
                example: `Click 'Check Code' to:
- Validate type compatibility
- Check struct alignment
- Get padding suggestions
- Ensure GPU compatibility`
            }
        ]
    }
};

// Workflow UI Manager
class WorkflowManager {
    constructor() {
        this.currentWorkflow = null;
        this.currentStep = 0;
    }
    
    showWorkflowList() {
        const container = document.getElementById('workflowPanel');
        if (!container) return;
        
        let html = '<div class="workflow-list">';
        html += '<div class="workflow-header">';
        html += '<h2>📖 Workflow Guides</h2>';
        html += '<button class="close-btn" onclick="workflowManager.hideWorkflows()">✕</button>';
        html += '</div>';
        html += '<p>Step-by-step guides for building with each mode</p>';
        
        for (let [key, workflow] of Object.entries(workflows)) {
            html += `
                <div class="workflow-item" onclick="workflowManager.showWorkflow('${key}')">
                    <h3>${workflow.title}</h3>
                    <p>${workflow.description}</p>
                    <span class="workflow-steps">${workflow.steps.length} steps</span>
                </div>
            `;
        }
        
        html += '<div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px;">';
        html += '<button onclick="workflowManager.showExamplesList()" style="width: 100%; padding: 10px;">View Example Workspaces Instead</button>';
        html += '</div>';
        
        html += '</div>';
        container.innerHTML = html;
        container.style.display = 'block';
    }
    
    showExamplesList() {
        console.log('[WorkflowManager] showExamplesList called');
        const container = document.getElementById('workflowPanel');
        if (!container) {
            console.error('[WorkflowManager] workflowPanel container not found');
            return;
        }
        console.log('[WorkflowManager] Container found:', container);
        
        let html = '<div class="workflow-list">';
        html += '<div class="workflow-header">';
        html += '<h2>📚 Example Workspaces</h2>';
        html += '<button class="close-btn" onclick="workflowManager.hideWorkflows()">✕</button>';
        html += '</div>';
        html += '<p>Load pre-built example workspaces to learn common patterns</p>';
        
        for (let [key, example] of Object.entries(examples)) {
            const modeColor = {
                'rust': '#CE422B',
                'wgsl': '#5C2E91',
                'bevy': '#4EC9B0',
                'mixed': '#888'
            }[example.mode] || '#888';
            
            html += `
                <div class="workflow-item" onclick="console.log('[WorkflowManager] Clicked example:', '${key}'); workflowManager.loadExample('${key}')">
                    <h3>${example.title} <span style="color: ${modeColor}; font-size: 0.8em;">[${example.mode}]</span></h3>
                    <p>${example.description}</p>
                </div>
            `;
        }
        
        html += '<div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px;">';
        html += '<button onclick="workflowManager.showWorkflowList()" style="width: 100%; padding: 10px;">View Workflow Guides Instead</button>';
        html += '</div>';
        
        html += '</div>';
        container.innerHTML = html;
        container.style.display = 'block';
    }
    
    loadExample(exampleKey) {
        console.log('[WorkflowManager] ========================================');
        console.log('[WorkflowManager] loadExample called with key:', exampleKey);
        console.log('[WorkflowManager] typeof exampleKey:', typeof exampleKey);
        console.log('[WorkflowManager] Available examples:', Object.keys(examples));
        console.log('[WorkflowManager] ========================================');
        
        const example = examples[exampleKey];
        if (!example) {
            console.error('[WorkflowManager] Example not found:', exampleKey);
            console.error('[WorkflowManager] Available keys:', Object.keys(examples));
            alert(`Example not found: ${exampleKey}`);
            return;
        }
        
        console.log('[WorkflowManager] Found example:', example.title);
        
        try {
            // Get workspace - try global variable first, then Blockly
            const ws = (typeof workspace !== 'undefined' && workspace) ? workspace : Blockly.getMainWorkspace();
            
            if (!ws) {
                throw new Error('Workspace not initialized');
            }
            
            console.log('[WorkflowManager] Workspace found, parsing XML...');
            const xmlText = example.xml;
            const xml = Blockly.utils.xml.textToDom(xmlText);
            
            console.log('[WorkflowManager] XML parsed, loading workspace directly...');
            
            // Disable events during loading to prevent validation errors
            Blockly.Events.disable();
            
            try {
                // Load directly without confirmation for better UX
                ws.clear();
                Blockly.Xml.domToWorkspace(xml, ws);
            } finally {
                // Re-enable events
                Blockly.Events.enable();
            }
            
            this.hideWorkflows();
            
            console.log('[WorkflowManager] Example loaded successfully');
            if (typeof showNotification === 'function') {
                showNotification(`Loaded example: ${example.title}`, 'success');
            }
        } catch (error) {
            console.error('[WorkflowManager] Error loading example:', error);
            if (typeof showNotification === 'function') {
                showNotification(`Failed to load example: ${error.message}`, 'error');
            } else {
                alert(`Failed to load example: ${error.message}`);
            }
        }
    }
    
    showWorkflow(workflowKey) {
        this.currentWorkflow = workflows[workflowKey];
        this.currentStep = 0;
        this.renderWorkflow();
    }
    
    renderWorkflow() {
        const container = document.getElementById('workflowPanel');
        if (!container || !this.currentWorkflow) return;
        
        const step = this.currentWorkflow.steps[this.currentStep];
        const totalSteps = this.currentWorkflow.steps.length;
        
        let html = '<div class="workflow-detail">';
        html += '<div class="workflow-header">';
        html += `<h2>${this.currentWorkflow.title}</h2>`;
        html += '<button class="close-btn" onclick="workflowManager.hideWorkflows()">✕</button>';
        html += '</div>';
        
        html += `<div class="workflow-progress">Step ${this.currentStep + 1} of ${totalSteps}</div>`;
        
        html += `<div class="workflow-step">`;
        html += `<h3>${step.title}</h3>`;
        html += `<p>${step.description}</p>`;
        
        if (step.example) {
            html += `<pre class="workflow-example">${this.escapeHtml(step.example)}</pre>`;
        }
        
        html += `</div>`;
        
        html += '<div class="workflow-navigation">';
        if (this.currentStep > 0) {
            html += '<button onclick="workflowManager.previousStep()">← Previous</button>';
        }
        if (this.currentStep < totalSteps - 1) {
            html += '<button onclick="workflowManager.nextStep()">Next →</button>';
        } else {
            html += '<button onclick="workflowManager.showWorkflowList()">Done ✓</button>';
        }
        html += '</div>';
        
        html += '</div>';
        container.innerHTML = html;
        container.style.display = 'block';
    }
    
    nextStep() {
        if (this.currentStep < this.currentWorkflow.steps.length - 1) {
            this.currentStep++;
            this.renderWorkflow();
        }
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderWorkflow();
        }
    }
    
    hideWorkflows() {
        const container = document.getElementById('workflowPanel');
        if (container) {
            container.style.display = 'none';
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize workflow manager
const workflowManager = new WorkflowManager();
console.log('[WorkflowManager] Initialized and exposed globally');
console.log('[WorkflowManager] window.workflowManager:', typeof window.workflowManager);
console.log('[WorkflowManager] workflowManager:', typeof workflowManager);

// Make sure it's globally accessible
if (typeof window !== 'undefined') {
    window.workflowManager = workflowManager;
    console.log('[WorkflowManager] Explicitly set window.workflowManager');
}
